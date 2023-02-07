import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { AppService } from 'src/app.service';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { ModeType, TransactionStatus } from 'src/utils/enum';
import { HttpRequestService } from 'src/utils/http-request';
import { DataSource } from 'typeorm';
import { AddCardDto } from '../user/dto/add-card.dto';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { VerifyAccountDto } from './dto/verify-account.dto';

@Injectable()
export class VerificationService {

  logger = new Logger('VerificationService');

  constructor(private userSvc: UserService,
    private dataSource: DataSource,
    private appSvc: AppService, 
    private httpReqSvc: HttpRequestService) {}

  async verifyBVN(bvn, user: UserEntity): Promise<IClientReturnObject> {
      try {

          if(!bvn) {
            return clientFeedback({
              status: 400,
              message: 'bvn cannot be empty'
            })
          }
    
          const response = await this.userSvc.getOneUserBankDetails(user.id);
          if(!response) {
            return clientFeedback( {
              status: 400,
              message: 'Please update your bank details before you continue.'
            })
          }
    
          const payload = {
            bvn,
            account_number: response.accountNumber,
            bank_code: response.bankCode
          }

          const result = await this.httpReqSvc.matchBVN(payload);
          const {data} = result;
          if(data && data.account_number && !data.is_blacklisted) {
            
             await this.userSvc.verifyBVN(user.id);
            
             return clientFeedback({
              status: 200,
              message: 'BVN look up successful'
             })

          }

          return result;
    
      } catch (error) {
        this.logger.error(error.message, error);
        return clientFeedback({
          message:  `Something failed, ${error.message}`,
          status: 500,
          trace: error
        })
      }
      

    }


    async verifyAccount(payload: VerifyAccountDto, user: UserEntity): Promise<IClientReturnObject> {
      try {

          const result = await this.httpReqSvc.resolveAccount(payload);
          const {data} = result;
          
          if(data && data.account_number) {
            
             return clientFeedback({
                status: 200,
                message: 'Account resolved successfully',
                data: {
                  accountNumber: data.account_number,
                  accountName: data.account_name,
                },
             })

          }

          return result;
    
      } catch (error) {
        this.logger.error(error.message, error);
        return clientFeedback({
          message:  `Something failed, ${error.message}`,
          status: 500,
          trace: error
        })
      }
    }

    async verifyPayment(referenceCode: string, user: UserEntity): Promise<IClientReturnObject> {

      const queryRunner = this.dataSource.createQueryRunner();
  
      try {
  
        await queryRunner.connect();
        await queryRunner.startTransaction();
  

        const result = await this.httpReqSvc.verifyPayment(referenceCode);

        const {data}  = result;

        if(data) {
          
          if (data.status === "failed") {
            return clientFeedback({
              status: 400,
              message: 'Payment failed'
            })
          }
    
          if (data.status === "success") {
  
            return await this.appSvc.reconcileAndSettlePayment(data, queryRunner);
    
          }
        }
  
        return result;
  
      } catch (error) {
        await queryRunner.rollbackTransaction();

        this.logger.error(`error in verifying payment - ${error.message} - ${error}`)

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

