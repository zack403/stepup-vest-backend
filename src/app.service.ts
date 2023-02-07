import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { DataSource, QueryRunner } from 'typeorm';
import { SavingsService } from './modules/savings/savings.service';
import { TransactionService } from './modules/transactions/transaction.service';
import { AddCardDto } from './modules/user/dto/add-card.dto';
import { UserService } from './modules/user/user.service';
import { IClientReturnObject } from './types/clientReturnObj';
import { clientFeedback } from './utils/clientReturnfunction';
import { ModeType, TransactionStatus } from './utils/enum';
import { HttpRequestService } from './utils/http-request';

@Injectable()
export class AppService {

  logger = new Logger('AppService')

  constructor(
    private httpReqSvc: HttpRequestService,
    private configService: ConfigService,
    private transSvc:  TransactionService,
    private userSvc: UserService,
    private savingsSvc: SavingsService,
    private dataSource: DataSource) {

  }

  getHello(): string {
    return 'Welcome to Stepup Vest api!';
  }

  async getBanks() {
    return await this.httpReqSvc.getBanks();
  }

  async onPaystackEvents(req: any): Promise<IClientReturnObject> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {

        await queryRunner.connect();
        await queryRunner.startTransaction();

        const hash = createHmac('sha512', `${this.configService.get('PAYSTACK_SECRET')}`).update(JSON.stringify(req.body)).digest('hex');
        if (hash == req.headers['x-paystack-signature']) {
      
        const response = req.body;

        this.logger.log("in paystack hook")

        if (response.event === 'charge.success') {
            const result = response.data;

            return await this.reconcileAndSettlePayment(result, queryRunner);
        }

        return clientFeedback({
          status: 200,
          message: `Event acknowledged`
        })
          
      }

    } catch (error) {

      this.logger.error(`Error in completing event hooks - ${error.message}`)
      
      
      await queryRunner.rollbackTransaction();
      return clientFeedback({
        status: 500,
        message: error.message,
        trace: error,
      })

    } finally {
      await queryRunner.release();
    }
  }


  async reconcileAndSettlePayment(payload: any, queryRunner: QueryRunner) {
    
    const transaction = await this.transSvc.findTransactionByReference(payload.reference);
    const amount = payload.amount / 100;
    
    if(transaction) {

        if(transaction.status === TransactionStatus.COMPLETED) {
          return clientFeedback ({ 
            status: 200,
            message: 'Transaction completed already.'
          })
        }
        const user = await this.userSvc.findByUserId(transaction.userId);
        
        switch (transaction.mode) {
          case ModeType.ADD_CARD:

            const {authorization} = payload;
            const cardExist = await this.userSvc.cardExist(transaction.userId, authorization.signature);

            if(!cardExist) {
              this.logger.log("here adding card")
              //add card here
              const request: AddCardDto = {
                email: user.email,
                userId: user.id,
                authorizatioCode: authorization.authorization_code,
                cardType: authorization.card_type,
                last4: authorization.last4,
                expMonth: authorization.exp_month,
                expYear: authorization.exp_year,
                bin: authorization.bin,
                bank: authorization.bank,
                channel: authorization.channel,
                signature: authorization.signature,
                countryCode: authorization.country_code,
                accountName: authorization.account_name,
                reusable: authorization.reusable,
                createdBy: user.email
              }

              await this.userSvc.addCard(request, queryRunner);

              this.logger.log("card added")
            }

            //update transactions table
            const data = {
              amount,
              status: TransactionStatus.COMPLETED,
              transactionDate: new Date()
            }

            await this.transSvc.updateTransactionByReference(transaction.reference, data, queryRunner);

            this.logger.log("transaction updated");

            await this.savingsSvc.updateOrSaveSavings(user, amount, queryRunner);

            this.logger.log("savings updated updated");
            break;

          case ModeType.MANUAL:

            const d = {
              amount,
              status: TransactionStatus.COMPLETED,
              transactionDate: new Date()
            }

            await this.transSvc.updateTransactionByReference(transaction.reference, d, queryRunner);

            await this.savingsSvc.updateOrSaveSavings(user, amount, queryRunner, transaction.savingTypeId);

            await this.transSvc.writeSavingsCharge(transaction, user.email, amount, queryRunner);

            break;
            
          default:
            break;
        }


        if(queryRunner.isTransactionActive) {
            await queryRunner.commitTransaction();
        }

        return clientFeedback({
          status: 200,
          message: `Your payment was successful`
        })

    }

    return clientFeedback({
      status: 200,
      message: `No transaction found`
    })
  }
}
