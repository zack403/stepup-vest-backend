import { HttpModule } from '@nestjs/axios';
import {  Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpRequestService } from 'src/utils/http-request';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { SavingsModule } from '../savings/savings.module';
import { UserModule } from '../user/user.module';
import { WithdrawalController } from './withdrawal.controller';
import { WithdrawalEntity } from './withdrawal.entity';
import { WithdrawalService } from './withdrawal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WithdrawalEntity,
    ]),
    HttpModule,
    AuthModule,
    AdminModule,
    SavingsModule,
    UserModule
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalService, HttpRequestService],
  exports: [TypeOrmModule, WithdrawalService]
})
export class WithdrawalsModule {}
