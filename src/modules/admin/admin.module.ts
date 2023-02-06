import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSettingEntity } from './entities/setting.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { SavingsTypeEntity } from './entities/savings-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminSettingEntity,
      SavingsTypeEntity
    ]),
    AuthModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [TypeOrmModule, AdminService]
})
export class AdminModule {}
