import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { UserService } from '../user/user.service';
import { HttpRequestService } from 'src/utils/http-request';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { TransactionService } from '../transactions/transaction.service';
import { TransactionModule } from '../transactions/transaction.module';
import { SavingsService } from '../savings/savings.service';
import { AdminService } from '../admin/admin.service';
import { SavingsModule } from '../savings/savings.module';
import { AdminModule } from '../admin/admin.module';
import { WithdrawalsModule } from '../withdrawals/withdrawal.module';
import { EmailService } from 'src/services/email/email.service';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    UserModule,
    TransactionModule,
    SavingsModule,
    AdminModule,
    WithdrawalsModule
  ],
  controllers: [VerificationController],
  providers: [
    VerificationService,
    UserService, 
    HttpRequestService, 
    SavingsService, 
    AdminService, 
    TransactionService,
    EmailService
  ]
})
export class VerificationModule {}
