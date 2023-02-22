import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dbConfig from './database/ormconfig';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { SavingsModule } from './modules/savings/savings.module';
import { TransactionModule } from './modules/transactions/transaction.module';
import { TransactionService } from './modules/transactions/transaction.service';
import { UserModule } from './modules/user/user.module';
import { UserService } from './modules/user/user.service';
import { VerificationModule } from './modules/verification/verification.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawal.module';
import { SeedsModule } from './seeds/seeds.module';
import { EmailService } from './services/email/email.service';
import { JobTaskModule } from './services/task-jobs/task-jobs.module';
import { HttpRequestService } from './utils/http-request';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({ ...dbConfig, autoLoadEntities: true }),
    AuthModule,
    UserModule,
    VerificationModule,
    HttpModule,
    AdminModule,
    TransactionModule,
    SavingsModule,
    SeedsModule,
    WithdrawalsModule,
    ScheduleModule.forRoot(),
    JobTaskModule,
  ],
  controllers: [AppController],
  providers: [AppService, HttpRequestService, TransactionService, UserService, EmailService],
})
export class AppModule { }
