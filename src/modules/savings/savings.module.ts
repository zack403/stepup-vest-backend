import {  Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { SavingsEntity } from './savings.entity';
import { SavingsController } from './savings.controller';
import { SavingsService } from './savings.service';
import { AdminService } from '../admin/admin.service';
import { AdminModule } from '../admin/admin.module';
import { TransactionService } from '../transactions/transaction.service';
import { TransactionModule } from '../transactions/transaction.module';
import { UserEntity } from '../user/entities/user.entity';
import { UserSettingEntity } from '../user/entities/setting.entity';
import { CardEntity } from '../user/entities/card.entity';
import { HttpRequestService } from 'src/utils/http-request';
import { EmailModule } from 'src/services/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SavingsEntity,
      UserEntity,
      UserSettingEntity,
      CardEntity
    ]),
    HttpModule,
    AuthModule,
    AdminModule,
    TransactionModule,
    EmailModule
  ],
  controllers: [SavingsController],
  providers: [SavingsService, AdminService, TransactionService, HttpRequestService],
  exports: [TypeOrmModule, SavingsService]
})
export class SavingsModule {}
