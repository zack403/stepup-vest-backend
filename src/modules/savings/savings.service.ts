import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { QueryRunner, Repository } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { UserEntity } from '../user/entities/user.entity';
import { SavingsEntity } from './savings.entity';

@Injectable()
export class SavingsService {

  logger = new Logger('SavingsService');

  constructor(
    private adminSvc: AdminService,
    @InjectRepository(SavingsEntity) private saveRepo: Repository<SavingsEntity>
    ) {}

    
    async getSavingsByType(userId: string, savingsTypeId): Promise<SavingsEntity> {
      return await this.saveRepo.findOne({where: {userId, savingsTypeId}});
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
         console.log(error);
      }
    }

    async updateOrSaveSavings(user: UserEntity, amount: any, queryRunner: QueryRunner): Promise<any> {
        const savingType = await this.adminSvc.getStepUpSavingsType();
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

