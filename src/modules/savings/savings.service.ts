import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { addDaysToCurrentDate } from 'src/utils/add-days-to-date';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { ModeType, SavingsFrequency, TransactionStatus, TransactionType } from 'src/utils/enum';
import { generatePaymentRef } from 'src/utils/generate-payment-ref';
import { HttpRequestService } from 'src/utils/http-request';
import { QueryRunner, Repository } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { SavingsTypeEntity } from '../admin/entities/savings-type.entity';
import { TransactionEntity } from '../transactions/transaction.entity';
import { TransactionService } from '../transactions/transaction.service';
import { CardEntity } from '../user/entities/card.entity';
import { UserSettingEntity } from '../user/entities/setting.entity';
import { UserEntity } from '../user/entities/user.entity';
import { SavingsEntity } from './savings.entity';

@Injectable()
export class SavingsService {

  logger = new Logger('SavingsService');

  constructor(
    private adminSvc: AdminService,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserSettingEntity) private readonly userSetRepo: Repository<UserSettingEntity>,
    @InjectRepository(CardEntity) private readonly cardRepo: Repository<CardEntity>,
    private readonly transSvc: TransactionService,
    private readonly httpReqSvc: HttpRequestService,
    @InjectRepository(SavingsEntity) private saveRepo: Repository<SavingsEntity>
    ) {}

    
    async getSavingsByType(userId: string, savingsTypeId): Promise<SavingsEntity> {
      return await this.saveRepo.findOne({where: {userId, savingsTypeId}});
    }

    
    async getSavingsByTypeSlug(userId: string, slug): Promise<IClientReturnObject> {
      
      try {
        const stype = await this.adminSvc.getSavingsTypeBySlug(slug);
        if(!stype) {
          return clientFeedback( {
            status: 404,
            message: 'not found'
          })
        }
  
        const result = await this.saveRepo.findOne({where: {userId, savingsTypeId: stype.id}});
  
        return clientFeedback( {
          status: 200,
          message: 'Fetched successfully',
          data: result
        })  

      } catch (error) {
        console.log(error);
      }
      
    }

    async getTotalSavings(userId): Promise<any> {
      return await this.saveRepo.createQueryBuilder("s")
      .where("s.userId = :userId", {userId})
      .select("SUM(s.balance) AS totalSavings")
      .getRawOne();

    }

    async getSavings(user: UserEntity): Promise<IClientReturnObject> {
      try {
        
        const r = await this.saveRepo.find({where: {userId: user.id}});

        return clientFeedback( {
          status: 200,
          message: 'Savings returned successfully',
          data: r
        });

      } catch (error) {
        this.logger.error(`Something failed - ${error.message} ${error}`);
        return clientFeedback({
            status: 500,
            message: `Something failed - ${error.message}`
        })
      }
    }

    async getQuickSaveReference({amount, savingTypeId}, user: UserEntity): Promise<IClientReturnObject> {
      try {

          const reference = generatePaymentRef();
          const savingType = await this.adminSvc.getSavingsTypeById(savingTypeId)

          const data = {
              userId: user.id,
              amount,
              reference,
              transactionDate: new Date(),
              transactionType: TransactionType.CREDIT,
              status: TransactionStatus.PENDING,    
              description: `${reference} - Quick save of ${amount} into ${savingType.name}`,
              mode: ModeType.MANUAL,
              savingTypeId,
              createdBy: user.email
          }

          const saved = await this.transSvc.saveTrans(data);

          return clientFeedback({
              status: 200,
              message: 'Quick safe reference generated successfully',
              data: saved
          })

      } catch (error) {
          this.logger.error(`Something failed - ${error.message} ${error}`);
          return clientFeedback({
              status: 500,
              message: `Something failed - ${error.message}`
          })
      }
  }

    async getSavingsType(): Promise<IClientReturnObject> {
    
      return await this.adminSvc.getSavingsType();
    }


    async updateOrSaveSavings(user: UserEntity, amount: any, queryRunner: QueryRunner, typeId?: string): Promise<any> {
        
        let savingType: SavingsTypeEntity;

        if(typeId) {
            savingType = await this.adminSvc.getSavingsTypeById(typeId);
        } else {
            savingType = await this.adminSvc.getStepUpSavingsType();
        }
            
        const saving = await this.getSavingsByType(user.id, savingType.id);
        
        if(saving) {

          saving.balance += amount;

          await queryRunner.manager.save(SavingsEntity, saving);
          
        } else {
          
          const saving = {
            balance: amount,
            userId: user.id,
            savingsTypeId: savingType.id,
            createdBy: user.email
          }

          await queryRunner.manager.save(SavingsEntity, saving);
        }
    }

    async checkIfReferralCanClaimBonus(user: UserEntity) {
        
      if(!user.referredBySettled) {
          
          if(user.referredBy) {
              
              const myReferrer = await this.userRepo.findOne({
                where: [
                  { referralCode: user.referredBy},
                  { phoneNumber: user.referredBy},
                ]
              });

              if(myReferrer) {
                  //check if user is eligible to claim referral bonus
                  const {totalsavings} = await this.getTotalSavings(user.id);
                  const setting = await this.adminSvc.getSetting();

                  if(parseInt(totalsavings) >= setting.referralBonusClaimLimit) {

                    
                    await this.userRepo.increment(
                      {
                        id: myReferrer.id
                      },
                      'referralBalance', setting.referralAmount
                    ); 

                    await this.userRepo.update(
                      {
                        id: user.id
                      },
                      {
                        referredBySettled: true
                      }
                    ); 
                  }
              }
              
          }
        }
    }


    async runAutoSave(queryRunner: QueryRunner) {
        
       const usersInAutoSave = await this.userSetRepo.createQueryBuilder("s")
         .where('s.nextSaveDate = CURRENT_DATE AND s.autoSave = true')
         .leftJoinAndSelect("s.user", "user")
         .getMany();  
         
         let savingType = await this.adminSvc.getStepUpSavingsType();

         for (const s of usersInAutoSave) {
            const card = await this.cardRepo.findOne({where: {id: s.cardId, userId: s.userId, reusable: true}});
            
            if(card) {
              const p = { 
                authorization_code : card.authorizationCode, 
                email: s.user.email, 
                amount: s.amount * 100 
              }

              const result = await this.httpReqSvc.recurringCharge(p);
              if(result) {
                const {data} = result;
                if(data) {
                  if(data.status === 'success') {
                  
                    let amount = data.amount / 100;
                    const tr = {
                       userId: s.userId,
                       amount,
                       reference: data.reference,
                       transactionDate: data.transaction_date,
                       transactionType: TransactionType.CREDIT,
                       status: TransactionStatus.COMPLETED,    
                       description: `${data.reference} - Auto save of ${amount} into ${savingType.name}`,
                       mode: ModeType.MANUAL,
                       savingTypeId: savingType.id,
                       createdBy: s.user.email
                    }
    
                    await queryRunner.manager.save(TransactionEntity, tr);
    
                    await this.updateOrSaveSavings(s.user, amount, queryRunner, savingType.id);
    
                    let newDate;
                    switch (s.frequency) {
                        case SavingsFrequency.DAILY: {
                            newDate = addDaysToCurrentDate(1)
                            s.nextSaveDate = newDate;
                            break;
                        }
                        case SavingsFrequency.WEEKLY: {
                            newDate = addDaysToCurrentDate(7)
                            s.nextSaveDate = newDate;
                            break;
                        }
                        case SavingsFrequency.MONTHLY: {
                            newDate = addDaysToCurrentDate(30)
                            s.nextSaveDate = newDate;
                            break;
                        }
                        default:
                            this.logger.log("nothing");
                    }
    
                    await queryRunner.manager.save(UserSettingEntity, s);
  
                    await this.checkIfReferralCanClaimBonus(s.user);
                    
                  }
    
                }
              }
             
             
            }
         }

         if(queryRunner.isTransactionActive) {
          await queryRunner.commitTransaction();
         }
    }


  }

