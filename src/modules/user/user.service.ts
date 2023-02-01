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

          const existAcctNo = await this.bdRepo.findOne({
            where: {
              accountNumber: req.accountNumber, 
              userId: user.id
            }
          });
        
          if(existAcctNo) {
            return clientFeedback({
              status: 400,
              message: 'Account Number already exist'
            })
          }


          const data = plainToClass(BankDetailsEntity, req);
          data.createdBy = user.email;
          data.userId = user.id;
    
          const saved = await this.bdRepo.save(data);

          await this.userRepo.update(
            {
              id: user.id
            },
            {
              bankDetailsAdded: true
            }
          );

          return clientFeedback({
            status: 200,
            message: 'Bank account added successfully',
            data: saved
          })

      } catch (error) {
        this.logger.log(`Something failed - ${error.message}`);
        return clientFeedback({
          message: `An error occured while adding bank details - Error: ${error.message}`,
          status: 500
        });
        
      }
      
  }

  async updateBankDetails(id: string, req: AddBankDetailsDto, user: UserEntity): Promise<IClientReturnObject> {
    try {
        const exist = await this.bdRepo.findOne({
          where: {
            id
          }
        });
      
        if(!exist) {
          return clientFeedback({
            status: 400,
            message: 'Bank detail not found'
          })
        }

        if(exist.accountNumber != req.accountNumber) {
          const acctInUse = await this.bdRepo.find({where: {accountNumber: req.accountNumber}});
          if(acctInUse) {
            return ({
              status: 400,
              message: 'Account number already in use'
            })
          }
        }

        if(exist.accountName != req.accountName) {
          const acctInUse = await this.bdRepo.find({where: {accountName: req.accountName}});
          if(acctInUse) {
            return ({
              status: 400,
              message: 'Account name already in use'
            })
          }
        }

        user.updatedAt = new Date();
        user.updatedBy = user.email;
      
        const dataToUpdated = plainToClassFromExist(exist, req);
        const updated = await this.userRepo.save(dataToUpdated);

        return clientFeedback({
          status: 200,
          message: 'Bank account updated successfully',
          data: updated
        })

    } catch (error) {
      this.logger.log(`Something failed - ${error.message}`);
      return clientFeedback({
        message: `An error occured while adding bank details - Error: ${error.message}`,
        status: 500
      });
      
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

async getOneUserBankDetails(userId): Promise<BankDetailsEntity> {
  const bankD = await this.bdRepo.findOne({where: {userId}});
  return bankD;
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
      user.updatedBy = user.email;
  
    
      const dataToUpdated = plainToClassFromExist(user, payload);
      const updated = await this.userRepo.save(dataToUpdated);

      return clientFeedback({
        message: "Successfully updated",
        status: 200,
        data: updated
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

  async verifyBVN(userId): Promise<void> {
    await this.userRepo.update({id: userId}, {bvnVerified: true});
  }
  
  async validateUser(payload: JwtPayload): Promise<UserEntity> {
    
    return await this.userRepo.findOne({where: {email: payload.email}});
  }
}
