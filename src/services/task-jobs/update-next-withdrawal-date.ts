import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression  } from '@nestjs/schedule';
import { UserService } from 'src/modules/user/user.service';
import { nextWithdrawalDate } from 'src/utils/next-withdrawal-date';


@Injectable()
export class UpdateNextWithdrawalDateService {
    
    private readonly logger = new Logger(UpdateNextWithdrawalDateService.name);


    constructor(
       private userSvc: UserService
    ){}

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async handle() {
      this.logger.log("update withdrawal date service started");
      
      try {
        
        const users = await this.userSvc.getAllUsers();
        for (const u of users) {
            u.withdrawDate = nextWithdrawalDate(u.withdrawDate);
            await this.userSvc.saveOrUpdateUser(u);
        }
  
      } catch (error) {
        this.logger.error(error);
      }

    }
}