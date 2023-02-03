import { AfterLoad, Column, CreateDateColumn, Entity } from 'typeorm';
import { AbstractBaseEntity } from 'src/utils/base-entity';
import { ModeType, TransactionStatus, TransactionType } from 'src/utils/enum';

@Entity('Transaction')
export class TransactionEntity extends AbstractBaseEntity {
  

    @Column({ type: 'numeric', precision: 10, scale: 2})
    amount: number;

    @Column({type: 'uuid'})
    userId: string;

    @Column({type: "varchar", length: 128})
    reference: string;

    @CreateDateColumn({ name: 'transactionDate', default: new Date() })
    transactionDate: Date;

    @Column({type: "enum", enum: TransactionType})
    transactionType: TransactionType;

    @Column({type: "enum", enum: TransactionStatus, default: TransactionStatus.PENDING})
    status: TransactionStatus;
    
    @Column({type: "varchar", length: 128})
    description: string;

    @Column({type: "enum", enum: ModeType})
    mode: ModeType;

    @AfterLoad()
    toNumber() {
        this.amount = parseFloat(this.amount as any);
    }
}

