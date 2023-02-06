import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AdminSettingsDto } from './dto/setting.dto';
import { SavingsTypeEntity } from './entities/savings-type.entity';
import { AdminSettingEntity } from './entities/setting.entity';

@Injectable()
export class AdminService {

  logger = new Logger('AdminService');

  constructor(
    @InjectRepository(SavingsTypeEntity) private stRepo: Repository<SavingsTypeEntity>,
    @InjectRepository(AdminSettingEntity) private admSetRepo: Repository<AdminSettingEntity>
    ) {}

        async updateSettings(req: AdminSettingsDto, user: UserEntity): Promise<IClientReturnObject> {
            
            try {

                if(!user.isAdmin) {
                    return clientFeedback({
                        status: 403,
                        message: 'Access denied!, contact administrator'
                    })
                }
    
                const set = plainToClass(AdminSettingEntity, req);
                set.createdBy = user.email;
    
                await this.admSetRepo.save(set);

                return clientFeedback({
                    status: 400,
                    message: 'Settings saved successfully'
                })
                
            } catch (error) {
                this.logger.error(error);
            }
           
        }
    

        async seedSetting (payload: any) {
            await this.admSetRepo.save(payload);
        }

        async checkSetting(): Promise<boolean> {
            const setting = await this.admSetRepo.find();
            if(setting.length > 0) return true;
            return false;
        }

        async seedSavingsType (payload: any) {
            await this.stRepo.save(payload);
        }

        async checkSavingsType(): Promise<boolean> {
            const st = await this.stRepo.find();
            if(st.length > 0) return true;
            return false;
        }

        async getSvaingsType(user: UserEntity): Promise<IClientReturnObject> {
            if(!user.isAdmin) {
                return clientFeedback({
                    status: 403,
                    message: 'Access denied!, contact administrator'
                })
            }
            const sts = await this.stRepo.find();
            return clientFeedback ({
                status: 200,
                message: 'Savings type fetched successfully',
                data: sts
            })
        }

        async getSavingsType(): Promise<IClientReturnObject> {
            const sts = await this.stRepo.find({where: {disabled: false}});
            return clientFeedback ({
                status: 200,
                message: 'Savings type fetched successfully',
                data: sts
            })
        }

        async getSavingsTypeById(id): Promise<SavingsTypeEntity> {
            return await this.stRepo.findOne({where: {id}});
        }

        async getStepUpSavingsType(): Promise<SavingsTypeEntity> {
             return await this.stRepo.findOne({where: {name: 'Stepupbank'}});
        }

  }

