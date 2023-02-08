import {  Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    AuthModule,
    AdminModule,
    SavingsModule,
    UserModule
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalService],
  exports: [TypeOrmModule]
})
export class WithdrawalsModule {}
