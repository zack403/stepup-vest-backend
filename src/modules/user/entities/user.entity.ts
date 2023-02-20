import { AfterLoad, Column, Entity, Index, OneToMany } from 'typeorm';
import { classToPlain, Exclude, instanceToPlain } from 'class-transformer';
import { AbstractBaseEntity } from '../../../utils/base-entity';
import { IsEmail } from 'class-validator';
import { TransactionEntity } from 'src/modules/transactions/transaction.entity';
import { SavingsEntity } from 'src/modules/savings/savings.entity';
import { WithdrawalEntity } from 'src/modules/withdrawals/withdrawal.entity';

@Entity('User')
export class UserEntity extends AbstractBaseEntity {
  
  @Index()
  @IsEmail()
  @Column({ unique: true, length: 128 })
  email: string;

  @Column({type: "varchar", length: 128})
  firstName: string;

  @Column({type: "varchar", length: 128})
  lastName: string;

  @Index()
  @Column({type: "varchar", length: 128})
  phoneNumber: string;

  @Column({type: "text", nullable: true, length: 128})
  address: string;

  @Column({type: "varchar", default: 'others', length: 128})
  heardAboutUs: string;

  @Index()
  @Column({type: "varchar", length: 128})
  referralCode: string;

  @Index()
  @Column({type: "varchar", nullable: true, length: 128})
  referredBy: string;
  
  @Column({type: "varchar", nullable: true, length: 128})
  gender: string;

  @Column({type: "varchar", nullable: true, length: 128})
  yearOfBirth: string;

  @Column({type: "varchar", nullable: true, length: 128})
  salaryRange: string;

  @Column({type: "varchar", nullable: true, length: 128})
  relationShipStatus: string;

  @Column({type: "varchar", nullable: true, length: 128})
  employmentStatus: string;

  @Column({type: "varchar", nullable: true, length: 128})
  profilePhoto: string;
  
  @Exclude({toPlainOnly: true})
  @Column()
  password: string;
  
  @Column({type: 'bool', default: false })
  isVerified: boolean;

  @Column({type: 'bool', default: false })
  bvnVerified: boolean;

  @Column({type: 'bool', default: false })
  debitCardAdded: boolean;

  @Column({type: 'bool', default: false })
  bankDetailsAdded: boolean;

  @Column({type: 'bool', default: false })
  twoFACompleted: boolean;

  @Column({type: 'bool', default: false })
  isAdmin: boolean;

  @Column({type: "numeric", default: 0, precision: 10, scale: 2})
  referralBalance: number;
  
  @Column({type: 'bool', default: false })
  referredBySettled: boolean;

  @Column({ type: 'date', nullable: true})
  withdrawDate: Date;

  //relations
  @OneToMany(() => TransactionEntity, t => t.user, {onDelete: 'CASCADE'})
  transactions: TransactionEntity[];

  @OneToMany(() => SavingsEntity, t => t.user, {onDelete: 'CASCADE'})
  savings: SavingsEntity[];

  @OneToMany(() => WithdrawalEntity, t => t.user, {onDelete: 'CASCADE'})
  withdrawals: WithdrawalEntity[];
  

  @AfterLoad()
  toNumber() {
      this.referralBalance = parseFloat(this.referralBalance as any);
  }


}

