import {  Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpRequestService } from 'src/utils/http-request';
import { HttpModule } from '@nestjs/axios';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionEntity } from './transaction.entity';
import { AuthModule } from '../auth/auth.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionEntity,
    ]),
    HttpModule,
    AuthModule,
    AdminModule
  ],
  controllers: [TransactionController],
  providers: [TransactionService, HttpRequestService],
  exports: [TypeOrmModule]
})
export class TransactionModule {}
