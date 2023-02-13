import { AfterLoad, Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from 'src/utils/base-entity';
import { SavingsTypeEntity } from '../admin/entities/savings-type.entity';

@Entity('Savings')
export class SavingsEntity extends AbstractBaseEntity {
  

    @Column({ type: 'numeric', precision: 10, scale: 2})
    balance: number;

    @Column({type: 'uuid'})
    userId: string;

    @Column({type: 'uuid'})
    savingsTypeId: string;

    @ManyToOne(() => SavingsTypeEntity)
    savingsType: SavingsTypeEntity;

    @AfterLoad()
    toNumber() {
        this.balance = parseFloat(this.balance as any);
    }
}

