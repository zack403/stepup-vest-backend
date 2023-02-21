import { Module } from '@nestjs/common';
import { SavingsModule } from 'src/modules/savings/savings.module';
import { UserModule } from 'src/modules/user/user.module';
import { WithdrawalsModule } from 'src/modules/withdrawals/withdrawal.module';
import { AutoSaveService } from './auto-save.service';
import { InitiateTransferService } from './initiate-transfer.service';
import { UpdateNextWithdrawalDateService } from './update-next-withdrawal-date';

@Module({
  imports: [ 
    SavingsModule, 
    WithdrawalsModule, 
    UserModule
  ],
  providers: [
    InitiateTransferService, 
    AutoSaveService, 
    UpdateNextWithdrawalDateService
  ],
})
export class JobTaskModule {}
