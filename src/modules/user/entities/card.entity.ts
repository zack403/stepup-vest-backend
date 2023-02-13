import { Column, Entity } from 'typeorm';
import { AbstractBaseEntity } from '../../../utils/base-entity';
import { IsEmail } from 'class-validator';

@Entity('Card')
export class CardEntity extends AbstractBaseEntity {
  
  @IsEmail()
  @Column({ length: 128 })
  email: string;

  @Column('uuid')
  userId: string;

  @Column({type: "varchar", length: 128})
  authorizationCode: string;

  @Column({type: "varchar", length: 128})
  cardType: string;

  @Column({type: "varchar", length: 128})
  last4: string;

  @Column({type: "varchar", length: 128})
  expMonth: string;

  @Column({type: "varchar", length: 128})
  expYear: string;

  @Column({type: "varchar", length: 128})
  bin: string;

  @Column({type: "varchar", length: 128})
  bank: string;

  @Column({type: "varchar", length: 128})
  channel: string;

  @Column({type: "varchar", length: 128})
  signature: string;

  @Column({type: "varchar", length: 128})
  countryCode: string;

  @Column({type: "varchar", nullable: true, length: 128})
  accountName: string;
  
  @Column({type: 'bool', default: false })
  reusable: boolean;



}

