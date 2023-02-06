import { AfterLoad, Column, Entity } from 'typeorm';
import { AbstractBaseEntity } from 'src/utils/base-entity';

@Entity('SavingsType')
export class SavingsTypeEntity extends AbstractBaseEntity {
  

    @Column({ type: 'numeric', default: 0, precision: 10, scale: 2})
    amount: number;

    @Column({type: "varchar", length: 128})
    name: string;
    
    @Column({type: "varchar", length: 128})
    currency: string;

    @Column({type: 'bool'})
    disabled: boolean;

    @AfterLoad()
    toNumber() {
        this.amount = parseFloat(this.amount as any);
    }
}

