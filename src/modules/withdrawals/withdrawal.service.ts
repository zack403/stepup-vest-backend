import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToClassFromExist } from 'class-transformer';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { WithdrawalStatus } from 'src/utils/enum';
import { generatePaymentRef } from 'src/utils/generate-payment-ref';
import { HttpRequestService } from 'src/utils/http-request';
import { Brackets, Repository } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { SavingsService } from '../savings/savings.service';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { RequestWithdrawlDto } from './dto/request-withdrawal.dto';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { WithdrawalQuery } from './dto/withdrawal-query.dto';
import { WithdrawalEntity } from './withdrawal.entity';


@Injectable()
export class WithdrawalService {

  logger = new Logger('WithdrawalService');

  constructor(
        private admSvc: AdminService,
        private userSvc: UserService,
        private savingSvc: SavingsService,
        private httpReqSvc: HttpRequestService,
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

          if(!await this.canWithdrawNow(user.id)) {
            return clientFeedback({
              status: 400,
              message: 'You cannot carry out this transaction as you have a pending one.'
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
          const amountToDisburse = req.amountToWithdraw - amountCharged;

          const data = plainToClass(WithdrawalEntity, req);
          data.createdBy = user.email;
          data.userId = user.id;
          data.amountCharged = amountCharged;
          data.percentageCharged = `${setting.percentageChargeOnWithdrawals}%`;
          data.amountToDisburse = amountToDisburse;

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

 
  async findAll({page, limit, status}: WithdrawalQuery, user: UserEntity): Promise<IClientReturnObject> {
    try {

        if(!user.isAdmin) {
            return clientFeedback({
                status: 400,
                message: 'Access denied'
            })
        }

        let withdrawals: WithdrawalEntity[] = [];

        if(status) {
            withdrawals =  await this.withRepo.find({
                where: {status}, 
                order: {createdAt: 'DESC'},
                skip: page ? limit * (page - 1) : 0,
                take: limit, 
            });
        } else {
            withdrawals =  await this.withRepo.find({ 
                order: {createdAt: 'DESC'},
                skip: page ? limit * (page - 1) : 0,
                take: limit, 
            });
    
        }

        
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
  
  async findMyWithdrawals({page, limit, status}: WithdrawalQuery, user: UserEntity): Promise<IClientReturnObject> {
    try {

        let withdrawals: WithdrawalEntity[] = [];

        if (status) {
            withdrawals =  await this.withRepo.find({
                where: {userId: user.id, status}, 
                order: {createdAt: 'DESC'},
                skip: page ? limit * (page - 1) : 0,
                take: limit, 
            });
    
        } else {
            withdrawals =  await this.withRepo.find({
                where: {userId: user.id}, 
                order: {createdAt: 'DESC'},
                skip: page ? limit * (page - 1) : 0,
                take: limit, 
            });
    
        }

        
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
        const amountToDisburse = payload.amountToWithdraw - amountCharged;


        withdrawal.amountCharged = amountCharged;
        withdrawal.percentageCharged = `${setting.percentageChargeOnWithdrawals}`;
        withdrawal.amountToDisburse = amountToDisburse;
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
        withdrawal.reference = generatePaymentRef();
    
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

  async initiateTransfer(): Promise<any> {
    const set = await this.admSvc.getSetting();
    const today = new Date();

    if(set.withdrawalDay === today.getDate()) {

        this.logger.log("initiating transfer");
        const result = await this.withRepo.createQueryBuilder("w")
        .leftJoinAndSelect("w.user", "user")
        .where("w.approved = :app", {app: true})
        .andWhere(new Brackets(qb => {
          qb.where("w.status = :st", {st: WithdrawalStatus.PENDING})
          .orWhere("w.status = :s", {s: WithdrawalStatus.FAILED})
        })).getMany();

        if(result.length > 0) {
          for (const r of result) {
            const bankDetails = await this.userSvc.getOneUserBankDetails(r.userId);
             if(bankDetails) {

              let amount = r.amountToDisburse * 100;
              const payload = { 
                source: "balance", 
                amount,
                reference: r.reference, 
                recipient: bankDetails.recipientCode, 
                reason: `Withdrawing ${r.amountToDisburse} for ${r.user.email}` 
              }

              const response = await this.httpReqSvc.initiateTransfer(payload);
              this.logger.log(response);
             }
          }
        }

    } 
  }

  async singleTransfer(id: string, user: UserEntity): Promise<IClientReturnObject> {
    try {

      if(!user.isAdmin) {
        return clientFeedback({
          status: 403,
          message: 'Access denied'
        })
      }

      const w = await this.withRepo.findOne({where: {id}, relations: ['user']});

      if(!w) {
        return clientFeedback({
          status: 404,
          message: 'Not found'
        })
      }

      if(!w.approved) {
        return clientFeedback({
          status: 400,
          message: 'Withdrawal not approved yet'
        })
      }

      if(w.status === WithdrawalStatus.PAID) {
        return clientFeedback({
          status: 400,
          message: 'Withdrawal paid already.'
        })
      }

      const bankDetails = await this.userSvc.getOneUserBankDetails(w.userId);
      if(bankDetails) {
        let amount = w.amountToDisburse * 100;
        const payload = { 
          source: "balance", 
          amount,
          reference: w.reference, 
          recipient: bankDetails.recipientCode, 
          reason: `Withdrawing ${w.amountToDisburse} for ${w.user.email}` 
        }
  
        const response = await this.httpReqSvc.initiateTransfer(payload);
        this.logger.log(response);
        return clientFeedback({
          status: response.status,
          message: response.message,
        })
  
      } else {
        return clientFeedback({
          status: 400,
          message: 'User has not set up withdrawal account'
        })
      }
      

    } catch (error) {
      return clientFeedback({
        status: 500,
        message: `something failed - ${error.message}`
    }) 
    }
  }

  async findWithdrawalByReference(reference): Promise<WithdrawalEntity> {
    return await this.withRepo.findOne({where: {reference}, relations: ['user', 'savingsType']});
}

  async canWithdrawNow(userId: string): Promise<boolean> {
      const result = await this.withRepo.createQueryBuilder("w")
      .where("w.userId = :userId", {userId})
      .andWhere("w.approved = :app", {app: true})
      .andWhere(new Brackets(qb => {
         qb.where("w.status = :st", {st: WithdrawalStatus.PAID})
         .orWhere("w.status = :s", {s: WithdrawalStatus.FAILED})
      })).getOne();

      if(result) {
         return false;
      }

      return true;
  }
}
