import { Column, Entity } from 'typeorm';
import { classToPlain, Exclude } from 'class-transformer';
import { AbstractBaseEntity } from '../../../utils/base-entity';
import { IsEmail } from 'class-validator';

@Entity('User')
export class UserEntity extends AbstractBaseEntity {
  
  @IsEmail()
  @Column({ unique: true, length: 128 })
  email: string;

  @Column({type: "varchar", length: 128})
  fullName: string;

  @Column({type: "varchar", length: 128})
  phoneNumber: string;

  @Column({type: "varchar",  length: 128})
  heardAboutUs: string;

  @Column({type: "varchar", nullable: true, length: 128})
  referralCode: string;
  
  @Column()
  @Exclude()
  password: string;
  
  @Column({type: 'bool', default: false })
  isVerified: boolean;

  toJSON() {
    return classToPlain(this);
  }

}

