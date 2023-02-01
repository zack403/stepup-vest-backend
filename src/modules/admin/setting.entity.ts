import { Column, Entity } from 'typeorm';
import { AbstractBaseEntity } from 'src/utils/base-entity';

@Entity('AdminSetting')
export class AdminSettingEntity extends AbstractBaseEntity {
  
  @Column({type: "numeric", default: 1000, precision: 10, scale: 2})
  referralAmount: number;

  
}

