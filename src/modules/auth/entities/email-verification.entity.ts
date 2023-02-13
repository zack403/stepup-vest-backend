import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../utils/base-entity';

@Entity('EmailVerification')
export class EmailVerificationEntity extends AbstractBaseEntity {
    
    @Column({type: 'uuid'})
    userId: string;

    @Column({type: 'varchar'})
    emailToken: string;
}