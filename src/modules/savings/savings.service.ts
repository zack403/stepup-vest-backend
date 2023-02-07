import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { ModeType, TransactionStatus, TransactionType } from 'src/utils/enum';
import { generatePaymentRef } from 'src/utils/generate-payment-ref';
import { QueryRunner, Repository } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { SavingsTypeEntity } from '../admin/entities/savings-type.entity';
import { TransactionService } from '../transactions/transaction.service';
import { UserEntity } from '../user/entities/user.entity';
import { SavingsEntity } from './savings.entity';

@Injectable()
export class SavingsService {

  logger = new Logger('SavingsService');

  constructor(
    private adminSvc: AdminService,
    private readonly transSvc: TransactionService,
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
            status: 400,
            message: 'not found'
          })
        }
  
        const result = await this.saveRepo.findOne({where: {userId, savingsTypeId: stype.id}});
  
        return clientFeedback( {
          status: 200,
          message: '',
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
      .getOne();

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

  }

