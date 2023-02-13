import { AfterLoad, Column, Entity } from 'typeorm';
import { AbstractBaseEntity } from 'src/utils/base-entity';

@Entity('AdminSetting')
export class AdminSettingEntity extends AbstractBaseEntity {
  
  @Column({type: "numeric", default: 1000, precision: 10, scale: 2})
  referralAmount: number;

  @Column({type: "numeric", default: 3.335}) // in percentage
  percentageChargeOnWithdrawals: number;

  @Column({type: "int", default: 28}) // the day of the month a user can withdraw
  withdrawalDay: number;

  @Column({type: "numeric", default: 5000})
  referralBonusClaimLimit: number;


  @AfterLoad()
  toNumber() {
      this.referralAmount = parseFloat(this.referralAmount as any);
      this.percentageChargeOnWithdrawals = parseFloat(this.percentageChargeOnWithdrawals as any);
      this.referralBonusClaimLimit = parseFloat(this.referralBonusClaimLimit as any);
  }
  
}

