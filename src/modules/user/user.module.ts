import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { BankDetailsEntity } from './entities/bank-details.entity';
import { CardEntity } from './entities/card.entity';
import { PassportModule } from '@nestjs/passport';
import { SavingsService } from '../savings/savings.service';
import { AdminService } from '../admin/admin.service';
import { TransactionService } from '../transactions/transaction.service';
import { SavingsEntity } from '../savings/savings.entity';
import { SavingsTypeEntity } from '../admin/entities/savings-type.entity';
import { AdminSettingEntity } from '../admin/entities/setting.entity';
import { TransactionEntity } from '../transactions/transaction.entity';
import { HttpRequestService } from 'src/utils/http-request';
import { HttpModule } from '@nestjs/axios';
import { WithdrawalEntity } from '../withdrawals/withdrawal.entity';
import { UserSettingEntity } from './entities/setting.entity';
import { EmailService } from 'src/services/email/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      BankDetailsEntity,
      CardEntity,
      SavingsEntity,
      SavingsTypeEntity,
      AdminSettingEntity,
      TransactionEntity,
      WithdrawalEntity,
      UserSettingEntity
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule
  ],
  controllers: [UserController],
  providers: [UserService, SavingsService, AdminService, TransactionService, HttpRequestService, EmailService],
  exports: [ TypeOrmModule, UserService]
})
export class UserModule {}
