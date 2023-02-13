import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { EmailService } from './email.service';


@Module({
    imports: [TypeOrmModule.forFeature([
        UserEntity,
      
    ])],
    controllers: [],
    
  providers: [
    EmailService
  ]
})
export class EmailModule {}
