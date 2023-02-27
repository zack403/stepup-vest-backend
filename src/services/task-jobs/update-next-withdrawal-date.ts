import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression  } from '@nestjs/schedule';
import { UserService } from 'src/modules/user/user.service';


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
          if(this.setWithdrawalDate(u.withdrawDate)) {
            u.withdrawDate = this.setWithdrawalDate(u.withdrawDate);
            await this.userSvc.saveOrUpdateUser(u);
          }
        }
  
      } catch (error) {
        this.logger.error(error);
      }

    }

    setWithdrawalDate = (date) => {
      const currentToDate = new Date(date);
      const today = new Date();
      if (today.setHours(0,0,0,0) <= currentToDate.setHours(0,0,0,0)) {
        return null;
      }

      return new Date( today.getMonth() === 11 ? today.getFullYear() + 1 :
        today.getFullYear(),
        today.getMonth() + 1,
        currentToDate.getDate()
      );

    }
}