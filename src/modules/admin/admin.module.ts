import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AdminSettingEntity } from './setting.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminSettingEntity
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
