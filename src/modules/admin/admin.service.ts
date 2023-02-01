import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AdminSettingsDto } from './dto/setting.dto';
import { AdminSettingEntity } from './setting.entity';

@Injectable()
export class AdminService {

  logger = new Logger('AdminService');

  constructor(@InjectRepository(AdminSettingEntity) private admSetRepo: Repository<AdminSettingEntity>) {}

        async updateSettings(req: AdminSettingsDto, user: UserEntity): Promise<IClientReturnObject> {
            
            try {

                if(!user.isAdmin) {
                    return clientFeedback({
                        status: 403,
                        message: 'Access denied, only an admin user can do this'
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

  }

