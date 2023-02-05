import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { UserService } from '../user/user.service';
import { HttpRequestService } from 'src/utils/http-request';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    UserModule
  ],
  controllers: [VerificationController],
  providers: [VerificationService, UserService, HttpRequestService]
})
export class VerificationModule {}
