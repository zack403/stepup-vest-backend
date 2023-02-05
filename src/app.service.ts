import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { DataSource } from 'typeorm';
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

      console.log(`req body`, req.body);

      //const hash = createHmac('sha512', `${this.configService.get('PAYSTACK_SECRET')}`).update(JSON.stringify(req.body)).digest('hex');
      //if (hash == req.headers['x-paystack-signature']) {
        //console.log("hash", hash);

        // Retrieve the request's body
        const response = req.body;
        console.log("response", response)

        if (response.event === 'charge.success') {
            const result = response.data;
            console.log("result", result)
            const transaction = await this.transSvc.findTransactionByReference(result.reference);
            const amount = result.amount / 100;
            
            if(transaction) {
                const user = await this.userSvc.findByUserId(transaction.userId);
                
              switch (transaction.mode) {
                case ModeType.ADD_CARD:

                  const {authorization} = result;
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


                    //update transactions table
                    const data = {
                      amount,
                      status: TransactionStatus.COMPLETED,
                      transactionDate: new Date()
                    }

                    await this.transSvc.updateTransactionByReference(transaction.reference, data, queryRunner);

                    this.logger.log("transaction updated")


                  }
                  
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
            
        }

        return clientFeedback({
          status: 200,
          message: `Your payment was successful`
        })
          
      //}

    } catch (error) {
      
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
}
