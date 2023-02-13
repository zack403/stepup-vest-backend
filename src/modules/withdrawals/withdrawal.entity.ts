import { AfterLoad, Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from 'src/utils/base-entity';
import { WithdrawalStatus } from 'src/utils/enum';
import { SavingsTypeEntity } from '../admin/entities/savings-type.entity';
import { UserEntity } from '../user/entities/user.entity';

@Entity('Withdrawals')
export class WithdrawalEntity extends AbstractBaseEntity {
  

    @Column({type: 'uuid'})
    userId: string;

    @Column({ type: 'numeric', precision: 10, scale: 2})
    amountToWithdraw: number;

    @Column({ type: 'numeric', precision: 10, scale: 2})
    amountCharged: number;

    @Column({ type: 'numeric', precision: 10, scale: 2})
    amountToDisburse: number;

    @Column({ type: 'varchar'})
    percentageCharged: string;

    @Column({ type: 'varchar', nullable: true})
    reference: string;

    @Column({type: 'uuid'})
    savingsTypeId: string;

    @ManyToOne(() => SavingsTypeEntity)
    savingsType: SavingsTypeEntity;

    @ManyToOne(() => UserEntity)
    user: UserEntity;

    @Column({type: 'bool', default: false})
    approved: boolean;

    @Column({ type: 'varchar', nullable: true})
    approvedBy: string;

    @Column({type: "enum", enum: WithdrawalStatus, default: WithdrawalStatus.PENDING})
    status: WithdrawalStatus;
  

    @AfterLoad()
    toNumber() {
        this.amountToWithdraw = parseFloat(this.amountToWithdraw as any);
        this.amountCharged = parseFloat(this.amountCharged as any);
        this.amountToDisburse = parseFloat(this.amountToDisburse as any);

    }
}

