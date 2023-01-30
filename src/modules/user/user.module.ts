import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { BankDetailsEntity } from './entities/bank-details.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      BankDetailsEntity
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
