import { Column, Entity } from 'typeorm';
import { AbstractBaseEntity } from 'src/utils/base-entity';

@Entity('SavingsType')
export class SavingsTypeEntity extends AbstractBaseEntity {

    @Column({type: "varchar", length: 128})
    name: string;

    @Column({type: "varchar", nullable: true, length: 128})
    slug: string;
    
    @Column({type: "varchar", length: 128})
    currency: string;

    @Column({type: 'bool'})
    disabled: boolean;

}

