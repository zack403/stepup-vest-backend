import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { AdminModule } from "src/modules/admin/admin.module";
import { AdminService } from "src/modules/admin/admin.service";
import { SavingsService } from "src/modules/savings/savings.service";
import { TransactionService } from "src/modules/transactions/transaction.service";
import { UserModule } from "src/modules/user/user.module";
import { UserService } from "src/modules/user/user.service";
import { EmailService } from "src/services/email/email.service";
import { HttpRequestService } from "src/utils/http-request";
import { SeedsService } from "./seeds.service";


@Module({
    imports: [
        UserModule,
        AdminModule,
        HttpModule
    ],
    providers: [SeedsService, UserService, AdminService, SavingsService, TransactionService, EmailService, HttpRequestService]
})

export class SeedsModule {}