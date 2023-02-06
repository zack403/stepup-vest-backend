import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { SeedsModule } from './seeds/seeds.module';
import { HttpRequestService } from './utils/http-request';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot(dbConfig),
    AuthModule,
    UserModule,
    VerificationModule,
    HttpModule,
    AdminModule,
    TransactionModule,
    SavingsModule,
    SeedsModule
  ],
  controllers: [AppController],
  providers: [AppService, HttpRequestService, TransactionService, UserService],
})
export class AppModule {}
