import { Column, Entity } from 'typeorm';
import { AbstractBaseEntity } from '../../../utils/base-entity';

@Entity('PasswordReset')
export class PasswordResetEntity extends AbstractBaseEntity {
    
    @Column({type: 'uuid'})
    userId: string;

    @Column({type: 'varchar'})
    resetToken: string;
}