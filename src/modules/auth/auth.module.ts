import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationEntity } from './entities/email-verification.entity';
import { PasswordResetEntity } from './entities/password-reset.entity';
import { EmailService } from '../../services/email/email.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { SavingsService } from '../savings/savings.service';
import { AdminService } from '../admin/admin.service';
import { TransactionService } from '../transactions/transaction.service';
import { HttpModule } from '@nestjs/axios';
import { HttpRequestService } from 'src/utils/http-request';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      EmailVerificationEntity,
      PasswordResetEntity,
    ]),
    UserModule,
    HttpModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    EmailService,
    UserService,
    SavingsService,
    AdminService,
    TransactionService,
    HttpRequestService
  ],
  exports: [PassportModule]
})
export class AuthModule {}
