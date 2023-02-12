import { Module } from '@nestjs/common';
import { SavingsModule } from 'src/modules/savings/savings.module';
import { WithdrawalsModule } from 'src/modules/withdrawals/withdrawal.module';
import { AutoSaveService } from './auto-save.service';
import { InitiateTransferService } from './initiate-transfer.service';

@Module({
  imports: [ SavingsModule, WithdrawalsModule],
  providers: [InitiateTransferService, AutoSaveService],
})
export class JobTaskModule {}
