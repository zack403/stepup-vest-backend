import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToClassFromExist } from 'class-transformer';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { GeneralQueryParams } from 'src/utils/general-query-param';
import { generateUniqueCode } from 'src/utils/generate-unique-code';
import { Repository } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { SavingsService } from '../savings/savings.service';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { RequestWithdrawlDto } from './dto/request-withdrawal.dto';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { WithdrawalEntity } from './withdrawal.entity';


@Injectable()
export class WithdrawalService {

  logger = new Logger('WithdrawalService');

  constructor(
        private admSvc: AdminService,
        private userSvc: UserService,
        private savingSvc: SavingsService,
        @InjectRepository(WithdrawalEntity) private withRepo: Repository<WithdrawalEntity>
    ) {}

  async requestWithdrawal(req: RequestWithdrawlDto, user: UserEntity): Promise<IClientReturnObject> {
      try {
          
          const exist = await this.admSvc.getSavingsTypeById(req.savingsTypeId);

          if(!exist) {
            return clientFeedback({
                status: 400,
                message: 'Plan does not exist'
            })
          }

          if(!await this.userSvc.userHasBankAccount(user.id)) {
            return clientFeedback({
                status: 400,
                message: 'Please set up a bank account before requesting for withdrawal'
            })
          }

          if(req.amountToWithdraw <= 0) {
            return clientFeedback({
                status: 400,
                message: 'Please specify a valid amount.'
            })
          }
    
          const userSaving = await this.savingSvc.getSavingsByTypeSlug(user.id, exist.slug);
         
          if(req.amountToWithdraw > userSaving.data.balance) {
            return clientFeedback({
                status: 400,
                message: 'Insufficient balance.'
            })
          }

          const setting = await this.admSvc.getSetting();

          const amountCharged = (req.amountToWithdraw * setting.percentageChargeOnWithdrawals) / 100;

          const data = plainToClass(WithdrawalEntity, req);
          data.createdBy = user.email;
          data.userId = user.id;
          data.amountCharged = amountCharged;
          data.percentageCharged = `${setting.percentageChargeOnWithdrawals}%`;
          
          const saved = await this.withRepo.save(data);

          return clientFeedback({
            status: 200,
            message: 'Withdrawals requested successfully',
            data: saved
          })

      } catch (error) {
        this.logger.log(`Something failed - ${error.message}`);
        return clientFeedback({
          message: `An error occured while requesting withdrawals - Error: ${error.message}`,
          status: 500
        });
        
      }
      
  }

 
  async findAll({page, limit}: GeneralQueryParams, user: UserEntity): Promise<IClientReturnObject> {
    try {

        if(!user.isAdmin) {
            return clientFeedback({
                status: 400,
                message: 'Access denied'
            })
        }

        const withdrawals =  await this.withRepo.find({ 
            order: {createdAt: 'DESC'},
            skip: page ? limit * (page - 1) : 0,
            take: limit, 
        });


        return clientFeedback({
            message: "Success",
            data: withdrawals,
            status: 200
        })

    } catch (error) {
      return clientFeedback({
        message:  `Something failed, ${error.message}`,
        status: 500
      })
    }
    
  }

  async findOne(id: string):Promise<IClientReturnObject> {
    if(!id) {
      return clientFeedback({
        message:  `Id is required`,
        status: 400
      })
    }

    try {
      const withdrawal = await this.withRepo.findOne({where: {id}});

      return clientFeedback({
        message: "Success",
        data: withdrawal,
        status: 200
      })
      
    } catch (error) {
      return clientFeedback({
        message:  `Something failed, ${error.message}`,
        status: 500
      })
    }
    
  }


  async update(id: string, payload: UpdateWithdrawalDto, user: UserEntity): Promise<IClientReturnObject> {
    
    try {
      
      const withdrawal = await this.withRepo.findOne({where: {id}});

      if(!withdrawal) {
        return clientFeedback({
          message:  "Withdrawal not found",
          status: 400
        })
      }

      if(withdrawal.approved) {
        return clientFeedback( {
            status: 200,
            message: 'Withdrawal approved and cannot be updated'
        })
      }

      const exist = await this.admSvc.getSavingsTypeById(payload.savingsTypeId);

        if(!exist) {
        return clientFeedback({
            status: 400,
            message: 'Plan does not exist'
        })
      }

      if(!await this.userSvc.userHasBankAccount(user.id)) {
        return clientFeedback({
            status: 400,
            message: 'Please set up a bank account before requesting for withdrawal'
        })
      }

      if(payload.amountToWithdraw <= 0) {
        return clientFeedback({
            status: 400,
            message: 'Please specify a valid amount.'
        })
      }

      const userSaving = await this.savingSvc.getSavingsByTypeSlug(user.id, exist.slug);
     
      if(payload.amountToWithdraw > userSaving.data.balance) {
        return clientFeedback({
            status: 400,
            message: 'Insufficient balance.'
        })
      }

      if(payload.amountToWithdraw != withdrawal.amountToWithdraw) {
        const setting = await this.admSvc.getSetting();

        const amountCharged = (payload.amountToWithdraw * setting.percentageChargeOnWithdrawals) / 100;

        withdrawal.amountCharged = amountCharged;
        withdrawal.percentageCharged = `${setting.percentageChargeOnWithdrawals}`;
      }

      withdrawal.updatedAt = new Date();
      withdrawal.updatedBy = user.email;
      
      const dataToUpdated = plainToClassFromExist(withdrawal, payload);
      const updated = await this.withRepo.save(dataToUpdated);

      return clientFeedback({
        message: "Successfully updated",
        status: 200,
        data: updated
      });

    } catch (error) {
      this.logger.log(`Something failed, ${error.message} - ${error}`)
      return clientFeedback({
        message:  `Something failed, ${error.message}`,
        status: 500,
        trace: error
      })
    }
    
  }


  async removeWithdrawal(id: string, user: UserEntity): Promise<IClientReturnObject> {
    
    try {

        const withdrawal = await this.withRepo.findOne({where: {id}});
        if(!withdrawal) {
            return clientFeedback({
              message:  "Withdrawal not found",
              status: 400
            })
        }
    
        if(withdrawal.approved) {
            return clientFeedback( {
                status: 200,
                message: 'Withdrawal approved and cannot be deleted'
            })
        }


        await this.withRepo.delete({id});

        return clientFeedback({
          status: 200,
          message: 'removed successfully'
        })

      
    } catch (error) {
      return clientFeedback({
        status: 500,
        message: 'something failed'
      })
    }
        
  }

  async approve(id: string, user: UserEntity): Promise<IClientReturnObject> {

    try {
        if(!user.isAdmin) {
            return clientFeedback({
                status: 400,
                message: 'Access denied'
            })
        }
        const withdrawal = await this.withRepo.findOne({where: {id}});
        if(!withdrawal) {
            return clientFeedback({
              message:  "Withdrawal not found",
              status: 400
            })
        }
    
        if(withdrawal.approved) {
            return clientFeedback( {
                status: 200,
                message: 'Withdrawal approved already'
            })
        }
    
        withdrawal.approved = true;
        withdrawal.approvedBy = user.email;
        withdrawal.reference = generateUniqueCode();
    
        const updated = await this.withRepo.save(withdrawal);
    
        return clientFeedback({
            message: "Successfully approved",
            status: 200,
            data: updated
        });
            
    } catch (error) {
        return clientFeedback({
            status: 500,
            message: 'something failed'
        })   
    }

  }
}
