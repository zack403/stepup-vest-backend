import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { HttpRequestService } from 'src/utils/http-request';
import { Repository } from 'typeorm/repository/Repository';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { VerifyAccountDto } from './dto/verify-account.dto';

@Injectable()
export class VerificationService {

  logger = new Logger('VerificationService');

  constructor(private userSvc: UserService, private httpReqSvc: HttpRequestService) {}

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
          
          if(result.data.account_number && !result.data.is_blacklisted) {
            
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
          
          if(data.account_number) {
            
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
  }

