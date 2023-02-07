import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminService } from "src/modules/admin/admin.service";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { UserService } from "src/modules/user/user.service";
import { hashPassword } from "src/utils/hasher";




@Injectable()
export class SeedsService implements OnModuleInit {

    logger = new Logger(SeedsService.name);

    constructor(
        private adminSvc: AdminService, 
        private userSvc: UserService,
        ) {}


    async onModuleInit() {
        try {

            await this.seedAdminUser();
            await this.saveAdminSetting();
            await this.saveSavingsType();

        } catch (error) {
            this.logger.error(error);
        }
    }

    async seedAdminUser () {

        const user = {
            email: 'info.rollworldmag@gmail.com',
            firstName: 'Roll',
            lastName: 'World',
            phoneNumber: '08035367218',
            referralCode: 'roll_world',
            password: 'School_5556',
            isAdmin: true,
            createdBy: 'Rollwordmagazine@gmail.com'
        }

        user.password = await hashPassword(user.password);
        
        const exist = await this.userSvc.findByEmail(user.email);
        if(exist)  return;

        await this.userSvc.saveAdminUser(user);

    }


    async saveAdminSetting () {
        const payload = {
            referralAmount: 1000,
            createdBy: 'admin'
        }

        if(await this.adminSvc.checkSetting()) return;
        
        await this.adminSvc.seedSetting(payload);

    }

    async saveSavingsType () {
        const payload = [
            {
                name: 'Stepupbank',
                currency: 'NGN',
                slug: 'stepupbank',
                disabled: false,
                createdBy: 'admin'
            },
            {
                name: 'Flex Naira',
                currency: 'NGN',
                slug: 'flexnaira',
                disabled: true,
                createdBy: 'admin'
            },
            {
                name: 'Safelock',
                slug: 'safelock',
                currency: 'NGN',
                disabled: true,
                createdBy: 'admin'
            },
            {
                name: 'Targets',
                slug: 'targets',
                currency: 'NGN',
                disabled: true,
                createdBy: 'admin'
            },
            {
                name: 'Flex Dollar',
                slug: 'flexdollar',
                currency: 'NGN',
                disabled: true,
                createdBy: 'admin'
            },
            {
                name: 'PocketApp',
                currency: 'NGN',
                slug: 'pocketapp',
                disabled: true,
                createdBy: 'admin'
            }
        ]

        if(await this.adminSvc.checkSavingsType()) return;
        
        await this.adminSvc.seedSavingsType(payload);

    }

}