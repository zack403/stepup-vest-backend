import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminService } from "src/modules/admin/admin.service";
import { AdminSettingEntity } from "src/modules/admin/setting.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { SeedsService } from "./seeds.service";


@Module({
    imports: [
        TypeOrmModule.forFeature(
            [
                AdminSettingEntity,
                UserEntity
            ]
        )
    ],
    providers: [SeedsService, AdminService]
})

export class SeedsModule {}