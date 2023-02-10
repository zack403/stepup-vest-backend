import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { DataSource, QueryRunner } from 'typeorm';
import { SavingsEntity } from './modules/savings/savings.entity';
import { SavingsService } from './modules/savings/savings.service';
import { TransactionEntity } from './modules/transactions/transaction.entity';
import { TransactionService } from './modules/transactions/transaction.service';
import { AddCardDto } from './modules/user/dto/add-card.dto';
import { UserService } from './modules/user/user.service';
import { WithdrawalEntity } from './modules/withdrawals/withdrawal.entity';
import { WithdrawalService } from './modules/withdrawals/withdrawal.service';
import { IClientReturnObject } from './types/clientReturnObj';
import { clientFeedback } from './utils/clientReturnfunction';
import { ModeType, TransactionStatus, TransactionType, WithdrawalStatus } from './utils/enum';
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
    private withdrawalSvc: WithdrawalService,
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

        const hash = createHmac('sha512', `${this.configService.get('PAYSTACK_SECRET')}`)
                    .update(JSON.stringify(req.body))
                    .digest('hex');
        
        if (hash == req.headers['x-paystack-signature']) {
      
          const response = req.body;

          this.logger.log("in paystack hook")

          const {event} = response;
          
          switch (event) {
            
            case 'charge.success':
              const result = response.data;
              await this.onChargeSuccess(result, queryRunner);
              break;

            case 'transfer.success':
              result.event = 'success';
              await this.onTransferEvent(result, queryRunner);
              break;

            case 'transfer.failed':
              result.event = 'failed';
              await this.onTransferEvent(result, queryRunner);
              break;

            case 'transfer.reversed':
              result.event = 'reversed';
              await this.onTransferEvent(result, queryRunner);
              break;

            default:
                this.logger.log("no event matched");
              break;
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


  async onChargeSuccess(payload: any, queryRunner: QueryRunner) {
    
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

            //await this.transSvc.writeSavingsCharge(transaction, user.email, amount, queryRunner);

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

  async onTransferEvent(payload: any, queryRunner: QueryRunner) {
    const withdrawal = await this.withdrawalSvc.findWithdrawalByReference(payload.reference);
    const amount = payload.amount / 100;
    
    this.logger.log(`on transfer event - ${payload.event}`)
    if(withdrawal) {

        if(withdrawal.status === WithdrawalStatus.PAID) {
          return clientFeedback ({ 
            status: 200,
            message: 'Withdrawal completed already.'
          })
        }
        
        const user = withdrawal.user;
        const {event} = payload;
        if(event === 'success') {
          withdrawal.status = WithdrawalStatus.PAID;
          await queryRunner.manager.save(WithdrawalEntity, withdrawal);
          
          //update plan balance
          await queryRunner.manager.decrement
                (SavingsEntity,
                  {
                    userId: user.id,
                    savingsTypeId: withdrawal.savingsTypeId
                  },
                  'balance', parseInt(withdrawal.amountToWithdraw as any)
                );
  
          //insert into transactions table
          const today = new Date();
          
          const data1 = {
            amount,
            userId: withdrawal.userId,
            reference: withdrawal.reference,
            transactionDate: today,
            transactionType: TransactionType.DEBIT,
            status: TransactionStatus.COMPLETED,
            description: `${withdrawal.reference} - Withdrawal made from your ${withdrawal.savingsType.name}`,
            mode: ModeType.MANUAL,
            savingTypeId: withdrawal.savingsTypeId,
            createdBy: user.email
          }
          await queryRunner.manager.save(TransactionEntity, data1);
  
          const data2 = {
            amount: withdrawal.amountCharged,
            userId: withdrawal.userId,
            reference: withdrawal.reference,
            transactionDate: today,
            transactionType: TransactionType.DEBIT,
            status: TransactionStatus.COMPLETED,
            description: `${withdrawal.percentageCharged} charging fee of your NGN${withdrawal.amountToWithdraw} Withdrawal`,
            mode: ModeType.MANUAL,
            savingTypeId: withdrawal.savingsTypeId,
            createdBy: user.email
          }
          await queryRunner.manager.save(TransactionEntity, data2);
  
          this.logger.log("transaction inserted");  
        } else if(event === 'failed') {

          withdrawal.status = WithdrawalStatus.FAILED;
          await queryRunner.manager.save(WithdrawalEntity, withdrawal);

        } else if (event === 'reversed') {
          withdrawal.status = WithdrawalStatus.FAILED;
          await queryRunner.manager.save(WithdrawalEntity, withdrawal);
        }
                
        if(queryRunner.isTransactionActive) {
            await queryRunner.commitTransaction();
        }

        return clientFeedback({
          status: 200,
          message: `Withdrawal successful`
        })

    }

    return clientFeedback({
      status: 200,
      message: `No transaction found`
    })

  }
}
