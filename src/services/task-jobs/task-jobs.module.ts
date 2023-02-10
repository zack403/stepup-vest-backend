import { Module } from '@nestjs/common';
import { AdminModule } from 'src/modules/admin/admin.module';
import { SavingsModule } from 'src/modules/savings/savings.module';
import { UserModule } from 'src/modules/user/user.module';
import { WithdrawalsModule } from 'src/modules/withdrawals/withdrawal.module';
import { InitiateTransferService } from './initiate-transfer.service';

@Module({
  imports: [AdminModule, UserModule, SavingsModule, WithdrawalsModule],
  providers: [InitiateTransferService],
})
export class JobTaskModule {}
