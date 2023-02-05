import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSettingEntity } from './setting.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminSettingEntity
    ]),
    AuthModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [TypeOrmModule]
})
export class AdminModule {}
