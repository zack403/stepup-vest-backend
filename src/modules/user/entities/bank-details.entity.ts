import { Column, Entity } from 'typeorm';
import { AbstractBaseEntity } from '../../../utils/base-entity';

@Entity('BankDetails')
export class BankDetailsEntity extends AbstractBaseEntity {

  @Column('uuid')
  userId: string; 

  @Column({type: "varchar", length: 128})
  bankName: string;

  @Column({type: "varchar", length: 128})
  accountName: string;

  @Column({type: "varchar",  length: 128})
  bankCode: string;

  @Column({type: "varchar",  length: 128})
  recipientCode: string;

  @Column({type: "varchar"})
  accountNumber: string;
  
  @Column({type: "varchar", nullable: true})
  accountType: string;
  

}

