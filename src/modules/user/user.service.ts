import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToClassFromExist } from 'class-transformer';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { JwtPayload } from 'src/types/jwtPayload';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { Repository } from 'typeorm/repository/Repository';
import { AddBankDetailsDto } from './dto/add-bank-details.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BankDetailsEntity } from './entities/bank-details.entity';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {

  logger = new Logger('UserService');

  constructor(
    @InjectRepository(BankDetailsEntity) private bdRepo: Repository<BankDetailsEntity>,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>) {}

  async addBankDetails(req: AddBankDetailsDto, user: UserEntity): Promise<IClientReturnObject> {
      try {
          const exist = await this.bdRepo.findOne({
            where: {
              accountName: req.accountName, 
              userId: user.id
            }
          });
        
          if(exist) {
            return clientFeedback({
              status: 400,
              message: 'Account already exist'
            })
          }

          const data = plainToClass(BankDetailsEntity, req);
          data.createdBy = user.email;
    
          await this.bdRepo.save(data);

          return clientFeedback({
            status: 200,
            message: 'Bank account added successfully'
          })

      } catch (error) {
        this.logger.log(`Something failed - ${error.message}`);
        
      }
      

  }

  async getBankDetails(user: UserEntity): Promise<IClientReturnObject> {
    try {
        const banksDetails = await this.bdRepo.find({
          where: {
            userId: user.id
          }
        });
      
        return clientFeedback({
          status: 200,
          message: 'Bank details fetched successfully',
          data: banksDetails
        })

    } catch (error) {
      this.logger.log(`Something failed - ${error.message}`);
      
    }
    

}
 
  async findAll(user: UserEntity): Promise<IClientReturnObject> {
    try {

    const users =  await this.userRepo.find({ 
       order: {createdAt: 'DESC'},
       take: 15, 
      });

    
      return clientFeedback({
        message: "Success",
        data: users,
        status: 200
      })

    } catch (error) {
      return clientFeedback({
        message:  `Something failed, ${error.message}`,
        status: 500
      })
    }
    
  }

  async findOne(id: string):Promise<IClientReturnObject> {
    if(!id) {
      return clientFeedback({
        message:  `Id is required`,
        status: 400
      })
    }

    try {
      const user = await this.userRepo.findOne({where: {id}});
            
      
      return clientFeedback({
        message: "Success",
        data: user,
        status: 200
      })
      
    } catch (error) {
      return clientFeedback({
        message:  `Something failed, ${error.message}`,
        status: 500
      })
    }
    
  }

  async update(id: string, payload: UpdateUserDto, user: UserEntity): Promise<IClientReturnObject> {
    
    try {
      const user = await this.userRepo.findOne({where: {id}});
      if(!user) {
        return clientFeedback({
          message:  "User not found",
          status: 400
        })
      }
  
      user.updatedAt = new Date();
      user.updatedBy = user.updatedBy || user.createdBy;
  
    
      const updated = plainToClassFromExist(user, payload);
      await this.userRepo.save(updated);

      return clientFeedback({
        message: "Successfully updated",
        status: 200
      });

    } catch (error) {
      this.logger.log(`Something failed, ${error.message} - ${error}`)
      return clientFeedback({
        message:  `Something failed, ${error.message}`,
        status: 500,
        trace: error
      })
    }
    
  }
  
  async validateUser(payload: JwtPayload): Promise<UserEntity> {
    
    return await this.userRepo.findOne({where: {email: payload.email}});
  }
}
