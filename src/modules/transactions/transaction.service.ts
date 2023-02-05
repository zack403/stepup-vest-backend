import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { ModeType, TransactionStatus, TransactionType } from 'src/utils/enum';
import { generatePaymentRef } from 'src/utils/generate-payment-ref';
import { QueryRunner } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { UserEntity } from '../user/entities/user.entity';
import { TransactionQuery } from './dto/transaction-query.dto';
import { TransactionEntity } from './transaction.entity';

@Injectable()
export class TransactionService {

  logger = new Logger('TransactionService');

  constructor(
    @InjectRepository(TransactionEntity) private readonly transRepo: Repository<TransactionEntity>) {}

    async getPaymentReference(user: UserEntity): Promise<IClientReturnObject> {
        try {

            const reference = generatePaymentRef();

            const data = {
                userId: user.id,
                amount: 0,
                reference,
                transactionDate: new Date(),
                transactionType: TransactionType.CREDIT,
                status: TransactionStatus.PENDING,    
                description: `${reference} - adding debit card transaction charge`,
                mode: ModeType.ADD_CARD,
                createdBy: user.email
            }

            const saved = await this.transRepo.save(data);

            return clientFeedback({
                status: 200,
                message: 'Payment reference generated successfully',
                data: saved
            })

        } catch (error) {
            this.logger.error(`Something failed - ${error.message} ${error}`);
            return clientFeedback({
                status: 500,
                message: `Something failed - ${error.message}`
            })
        }
    }

    async findTransactionByReference(reference): Promise<TransactionEntity> {
        return await this.transRepo.findOne({where: {reference: reference}});
    }

    async updateTransactionByReference(ref, data, queryRunner: QueryRunner): Promise<any> {
        return await queryRunner.manager.update(TransactionEntity, {reference: ref}, 
            {
                ...data 
            })
    }

    async getTransactions(query: TransactionQuery, user: UserEntity): Promise<IClientReturnObject> {

        try {
            const result: Array<TransactionEntity> = [];
            let totalCount = 0;

            const {limit, page, transactionType} = query;

            if(transactionType) {

                const [items, count] = await this.transRepo.findAndCount( {
                    where: {userId: user.id, transactionType},
                    order: {transactionDate : 'DESC'},
                    take: limit,
                    skip: page ? limit * (page - 1) : 0
                })
                
                result.push(...items);
                totalCount = count;

            } else {
                
                const [items, count] = await this.transRepo.findAndCount( {
                    where: {userId: user.id},
                    order: {transactionDate : 'DESC'},
                    take: limit,
                    skip: page ? limit * (page - 1) : 0
                })

                result.push(...items);
                totalCount = count;
            }

            return clientFeedback( {
                status: 200,
                message: 'Transactions fetched successfully',
                data: {
                    page,
                    totalCount,
                    data: result
                }
            })
            
                                    
        } catch (error) {
            this.logger.error('something failed', error.message);
            return clientFeedback({
                status: 500,
                message: `Something failed - ${error.message} `
            })
        }

    }
  }

