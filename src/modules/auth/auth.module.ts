import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { EmailVerificationEntity } from './entities/email-verification.entity';
import { PasswordResetEntity } from './entities/password-reset.entity';
import { EmailService } from '../../services/email/email.service';
import { UserService } from '../user/user.service';
import { BankDetailsEntity } from '../user/entities/bank-details.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      UserEntity,
      EmailVerificationEntity,
      PasswordResetEntity,
      BankDetailsEntity
    ])
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    EmailService, 
    UserService
  ]
})
export class AuthModule {}
