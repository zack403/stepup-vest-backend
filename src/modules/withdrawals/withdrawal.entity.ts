import { AfterLoad, Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from 'src/utils/base-entity';
import { TransactionStatus } from 'src/utils/enum';
import { SavingsTypeEntity } from '../admin/entities/savings-type.entity';

@Entity('Withdrawals')
export class WithdrawalEntity extends AbstractBaseEntity {
  

    @Column({type: 'uuid'})
    userId: string;

    @Column({ type: 'numeric', precision: 10, scale: 2})
    amountToWithdraw: number;

    @Column({ type: 'numeric', precision: 10, scale: 2})
    amountCharged: number;

    @Column({ type: 'numeric', default: 0, precision: 10, scale: 2})
    amountToDisburse: number;

    @Column({ type: 'varchar'})
    percentageCharged: string;

    @Column({ type: 'varchar', nullable: true})
    reference: string;

    @Column({type: 'uuid'})
    savingsTypeId: string;

    @ManyToOne(() => SavingsTypeEntity)
    savingsType: SavingsTypeEntity;

    @Column({type: 'bool', default: false})
    approved: boolean;

    @Column({ type: 'varchar', nullable: true})
    approvedBy: string;

    @Column({type: "enum", enum: TransactionStatus, default: TransactionStatus.PENDING})
    status: TransactionStatus;
  

    @AfterLoad()
    toNumber() {
        this.amountToWithdraw = parseFloat(this.amountToWithdraw as any);
        this.amountCharged = parseFloat(this.amountCharged as any);
    }
}

