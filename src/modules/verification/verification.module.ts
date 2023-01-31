import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { UserService } from '../user/user.service';
import { HttpRequestService } from 'src/utils/http-request';
import { BankDetailsEntity } from '../user/entities/bank-details.entity';
import { UserEntity } from '../user/entities/user.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      BankDetailsEntity
    ]),
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [VerificationController],
  providers: [VerificationService, UserService, HttpRequestService]
})
export class VerificationModule {}
