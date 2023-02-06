import {  Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { SavingsEntity } from './savings.entity';
import { SavingsController } from './savings.controller';
import { SavingsService } from './savings.service';
import { AdminService } from '../admin/admin.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SavingsEntity,
    ]),
    HttpModule,
    AuthModule,
    AdminModule
  ],
  controllers: [SavingsController],
  providers: [SavingsService, AdminService],
  exports: [TypeOrmModule, SavingsService]
})
export class SavingsModule {}
