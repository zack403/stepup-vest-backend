import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "src/modules/admin/admin.module";
import { AdminService } from "src/modules/admin/admin.service";
import { AdminSettingEntity } from "src/modules/admin/entities/setting.entity";
import { SavingsService } from "src/modules/savings/savings.service";
import { TransactionService } from "src/modules/transactions/transaction.service";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { UserModule } from "src/modules/user/user.module";
import { UserService } from "src/modules/user/user.service";
import { SeedsService } from "./seeds.service";


@Module({
    imports: [
        UserModule,
        AdminModule
    ],
    providers: [SeedsService, UserService, AdminService, SavingsService, TransactionService]
})

export class SeedsModule {}