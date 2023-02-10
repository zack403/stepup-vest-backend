import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression  } from '@nestjs/schedule';
import { WithdrawalService } from 'src/modules/withdrawals/withdrawal.service';


@Injectable()
export class InitiateTransferService {
    
    private readonly logger = new Logger(InitiateTransferService.name);


    constructor(
       private withdrawalSvc: WithdrawalService
    ){}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handle() {
      this.logger.log("Transfer initiation service started");
      
      try {
        
        await this.withdrawalSvc.initiateTransfer();
  
      } catch (error) {
        this.logger.error(error);
      }

    }
}