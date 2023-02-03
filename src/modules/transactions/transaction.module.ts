import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { HttpRequestService } from 'src/utils/http-request';
import { HttpModule } from '@nestjs/axios';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionEntity } from './transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionEntity,
    ]),
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, HttpRequestService]
})
export class TransactionModule {}
