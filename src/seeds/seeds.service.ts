import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminService } from "src/modules/admin/admin.service";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { hashPassword } from "src/utils/hasher";
import { Repository } from "typeorm";




@Injectable()
export class SeedsService implements OnModuleInit {

    logger = new Logger(SeedsService.name);

    constructor(
        private adminSvc: AdminService, 
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>
        ) {}


    async onModuleInit() {
        try {

            await this.seedAdminUser();
            await this.saveAdminSetting();

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
        
        const exist = await this.userRepo.findOne({where: {email: user.email}});
        if(exist)  return;

        await this.userRepo.save(user);

    }


    async saveAdminSetting () {
        const payload = {
            referralAmount: 1000,
            createdBy: 'admin'
        }

        await this.adminSvc.seedSetting(payload);

    }

}