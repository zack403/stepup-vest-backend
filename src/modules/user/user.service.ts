import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToClassFromExist } from 'class-transformer';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { JwtPayload } from 'src/types/jwtPayload';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { WithdrawalStatus } from 'src/utils/enum';
import { HttpRequestService } from 'src/utils/http-request';
import { DataSource, QueryRunner } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { SavingsService } from '../savings/savings.service';
import { WithdrawalEntity } from '../withdrawals/withdrawal.entity';
import { WithdrawalService } from '../withdrawals/withdrawal.service';
import { AddBankDetailsDto } from './dto/add-bank-details.dto';
import { AddCardDto } from './dto/add-card.dto';
import { UpdateUserSettingDto } from './dto/update-setting.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BankDetailsEntity } from './entities/bank-details.entity';
import { CardEntity } from './entities/card.entity';
import { UserSettingEntity } from './entities/setting.entity';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {

  logger = new Logger('UserService');

  constructor(
    @InjectRepository(BankDetailsEntity) private bdRepo: Repository<BankDetailsEntity>,
    @InjectRepository(CardEntity) private cardRepo: Repository<CardEntity>,
    private savingSvc: SavingsService,
    @InjectRepository(WithdrawalEntity) private readonly withdrawalRepo: Repository<WithdrawalEntity>,
    private httpReqSvc: HttpRequestService,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(UserSettingEntity) private userSetRepo: Repository<UserSettingEntity>,

    ) {}

  async addBankDetails(req: AddBankDetailsDto, user: UserEntity): Promise<IClientReturnObject> {
      try {
          const exist = await this.bdRepo.findOne({
            where: {
              accountName: req.accountName,
              accountNumber: req.accountNumber, 
              userId: user.id
            }
          });
        
          if(exist) {
            if(exist.accountNumber != req.accountNumber) {

              const payload = { 
                type: "nuban", 
                name: req.accountName, 
                account_number: req.accountNumber, 
                bank_code: req.bankCode, 
                currency: "NGN"
              }
              const result = await this.httpReqSvc.createTransferRecipient(payload);
              const {data} = result;
              if(data && data.recipient_code) {
                exist.recipientCode = data.recipient_code;
              }

              await this.bdRepo.save(exist);

              return clientFeedback({
                status: 200,
                message: 'Bank account added successfully',
                data: exist
              })
            }

          } else {         
              const mapped = plainToClass(BankDetailsEntity, req);
              mapped.createdBy = user.email;
              mapped.userId = user.id;
        
              const payload = { 
                  type: "nuban", 
                  name: req.accountName, 
                  account_number: req.accountNumber, 
                  bank_code: req.bankCode, 
                  currency: "NGN"
              }

              const result = await this.httpReqSvc.createTransferRecipient(payload);
              const {data} = result;
              if(data && data.recipient_code) {
                mapped.recipientCode = data.recipient_code;
              }
            
              const saved = await this.bdRepo.save(mapped);
              await this.userRepo.update(
                {
                  id: user.id
                },
                {
                  bankDetailsAdded: true
                }
              );
    
              return clientFeedback({
                status: 200,
                message: 'Bank account added successfully',
                data: saved
              })
          
          }

      } catch (error) {
        this.logger.log(`Something failed - ${error.message}`);
        return clientFeedback({
          message: `An error occured while adding bank details - Error: ${error.message}`,
          status: 500
        });
        
      }
      
  }

  async updateBankDetails(id: string, req: AddBankDetailsDto, user: UserEntity): Promise<IClientReturnObject> {
    try {
        const exist = await this.bdRepo.findOne({
          where: {
            id
          }
        });
      
        if(!exist) {
          return clientFeedback({
            status: 404,
            message: 'Bank detail not found'
          })
        }

        if(exist.accountNumber != req.accountNumber) {
          const acctInUse = await this.bdRepo.find({where: {accountNumber: req.accountNumber}});
          if(acctInUse) {
            return ({
              status: 400,
              message: 'Account number already in use'
            })
          }
        }

        if(exist.accountName != req.accountName) {
          const acctInUse = await this.bdRepo.find({where: {accountName: req.accountName}});
          if(acctInUse) {
            return ({
              status: 400,
              message: 'Account name already in use'
            })
          }
        }

        user.updatedAt = new Date();
        user.updatedBy = user.email;
      
        const dataToUpdated = plainToClassFromExist(exist, req);
        const updated = await this.userRepo.save(dataToUpdated);

        return clientFeedback({
          status: 200,
          message: 'Bank account updated successfully',
          data: updated
        })

    } catch (error) {
      this.logger.log(`Something failed - ${error.message}`);
      return clientFeedback({
        message: `An error occured while adding bank details - Error: ${error.message}`,
        status: 500
      });
      
    }
    

}

  async getBankDetails(user: UserEntity): Promise<IClientReturnObject> {
    try {
        const banksDetails = await this.bdRepo.find({
          where: {
            userId: user.id
          }
        });
      
        return clientFeedback({
          status: 200,
          message: 'Bank details fetched successfully',
          data: banksDetails
        })

    } catch (error) {
      this.logger.log(`Something failed - ${error.message}`);
      
    }
}

async getOneUserBankDetails(userId): Promise<BankDetailsEntity> {
  const bankD = await this.bdRepo.findOne({where: {userId}});
  return bankD;
}
 
  async findAll(user: UserEntity): Promise<IClientReturnObject> {
    try {

    const users =  await this.userRepo.find({ 
       order: {createdAt: 'DESC'},
       take: 15, 
      });

    
      return clientFeedback({
        message: "Success",
        data: users,
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
      const user = await this.userRepo.findOne({where: {id}});

      if(user) {
        delete user.password;
        delete user.isAdmin;
      }
      
      return clientFeedback({
        message: "Success",
        data: user,
        status: 200
      })
      
    } catch (error) {
      return clientFeedback({
        message:  `Something failed, ${error.message}`,
        status: 500
      })
    }
    
  }

  
  async findByEmail(email: string):Promise<UserEntity> {
  
      const user = await this.userRepo.findOne({where: {email}});
      
      if(user) {
        //delete user.password;
        delete user.isAdmin;
      }
      
      return user;  
  }

  async findByPhoneNumber(phoneNumber: string):Promise<UserEntity> {
  
    const user = await this.userRepo.findOne({where: {phoneNumber}});
    
    if(user) {
      delete user.password;
      delete user.isAdmin;
    }
    
    return user;  
}

async findByUserId(id: string):Promise<UserEntity> {
  
  const user = await this.userRepo.findOne({where: {id}});
  
  if(user) {
    //delete user.password;
    delete user.isAdmin;
  }
  
  return user;  
}

  async saveAdminUser(user: any): Promise<UserEntity> {
    return await this.userRepo.save(user);
  }

  async saveOrUpdateUser(user: UserEntity): Promise<UserEntity> {
    return await this.userRepo.save(user);
  }

  async update(payload: UpdateUserDto, user: UserEntity): Promise<IClientReturnObject> {
    
    try {
      const us = await this.userRepo.findOne({where: {id: user.id}});
      if(!us) {
        return clientFeedback({
          message:  "User not found",
          status: 404
        })
      }
  
      us.updatedAt = new Date();
      us.updatedBy = user.email;
  
    
      const dataToUpdated = plainToClassFromExist(us, payload);
      const updated = await this.userRepo.save(dataToUpdated);

      delete updated.password;
      delete updated.isAdmin;

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

  async getCards(user: UserEntity): Promise<IClientReturnObject> {
    const cards =  await this.cardRepo.find({where: {userId: user.id}});
    let results = [];
    
    for (const c of cards) {

      const dataToReturn = {
        id: c.id,
        accountName: c.accountName, 
        bank: c.bank, 
        cardType: c.cardType, 
        expMonth: c.expMonth, 
        expYear: c.expYear,
        last4: c.last4
      }

      results.push(dataToReturn);

    }
   

    return clientFeedback({
      status: 200,
      message: 'Cards fetched successfully',
      data: results
    })
  }

  async verifyBVN(userId): Promise<void> {
    await this.userRepo.update({id: userId}, {bvnVerified: true});
  }
  
  async validateUser(payload: JwtPayload): Promise<UserEntity> {
    
    return await this.userRepo.findOne({where: {email: payload.email}});
  }

  async cardExist(userId, cardSignature): Promise<CardEntity> {
    return await this.cardRepo.findOne({where: {userId, signature: cardSignature}});
  }

  async addCard(payload: AddCardDto, queryRunner: QueryRunner): Promise<any> {
    const data = plainToClass(CardEntity, payload);

    await queryRunner.manager.save(CardEntity, data);
    
    await queryRunner.manager.update(UserEntity,
      {
        id: payload.userId
      },
      {
        debitCardAdded: true
      }
    );
  }

  async getStats(user: UserEntity): Promise<any> {
    try {

      const {totalsavings} = await this.savingSvc.getTotalSavings(user.id);
      const {totalwithdrawals} = await await this.withdrawalRepo.createQueryBuilder("s")
                  .where("s.userId = :userId", {userId: user.id})
                  .andWhere("s.status = :st", {st: WithdrawalStatus.PAID})
                  .select("SUM(s.amountToDisburse) AS totalWithdrawals")
                  .getRawOne();

      const loanEligibility = 0;
      const referralBonus = user.referralBalance;

      return clientFeedback( {
        status: 200,
        message: 'Dashboard stats fetched successfully',
        data: {
          totalSavings: parseFloat(totalsavings) || 0,
          totalWithdrawals: parseFloat(totalwithdrawals) || 0,
          loanEligibility,
          referralBonus
        }
      })

    } catch (error) {
      
    }
  }

  async removeCard(cardId, user: UserEntity): Promise<IClientReturnObject> {
    
    try {

        const cards = await this.cardRepo.find({where: {userId: user.id}});
        if(cards.length <= 1) {
          return clientFeedback({
            status: 200,
            message: `You need to have atleast one card`
          })
        }

        //check if card in use

        await this.cardRepo.delete({id: cardId});

        return clientFeedback({
          status: 200,
          message: 'Card removed successfully'
        })

      
    } catch (error) {
      return clientFeedback({
        status: 500,
        message: 'something failed'
      })
    }     
  }

  async updateSetting(payload: UpdateUserSettingDto, user: UserEntity): Promise<IClientReturnObject> {
      try {

        const card = await this.cardRepo.findOne({where: {userId: user.id, id: payload.cardId}});
        if(!card) {
          return clientFeedback({
            status: 400,
            message: 'Invalid request'
          })
        }

        const set = await this.userSetRepo.findOne({where: {userId: user.id}});
        
        if(set) {

          set.autoSave = payload.autoSave;
          set.frequency = payload.frequency;
          set.amount = payload.amount;
          set.cardId = payload.cardId;
          set.dayToSave = payload.dayToSave;
          set.timeToSave = payload.timeToSave;
          set.whenToStart = payload.whenToStart;

          await this.userSetRepo.save(set);

        } else {
          
          const newSet = plainToClass(UserSettingEntity, payload);
          newSet.createdBy = user.email;
          newSet.userId = user.id;

          await this.userSetRepo.save(newSet);
        }

        return clientFeedback({
          status: 200,
          message: 'Setting saved successfully'
        })
        
      } catch (error) {
        return clientFeedback({
          status: 500,
          message: `something failed - ${error.message}`
        })
      }
  }

  async userHasBankAccount(userId: string): Promise<boolean> {
    const bank = await this.bdRepo.findOne({where: {userId}});
    if(bank) return true;
    return false;
  } 
}
