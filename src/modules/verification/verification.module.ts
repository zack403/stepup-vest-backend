import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [VerificationController],
  providers: [VerificationService]
})
export class VerificationModule {}
