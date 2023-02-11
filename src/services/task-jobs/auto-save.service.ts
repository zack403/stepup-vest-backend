import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression  } from '@nestjs/schedule';
import { UserService } from 'src/modules/user/user.service';


@Injectable()
export class AutoSaveService {
    
    private readonly logger = new Logger(AutoSaveService.name);


    constructor(
       private userSvc: UserService
    ){}

    @Cron(CronExpression.EVERY_30_MINUTES)
    async handle() {
      this.logger.log("Auto saving service started");
      
      try {
        
        
  
      } catch (error) {
        this.logger.error(error);
      }

    }
}