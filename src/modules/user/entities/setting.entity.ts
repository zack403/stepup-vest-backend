import { SavingsDayOfTheWeek, SavingsFrequency, TimeToSave, WhenToStartSaving } from 'src/utils/enum';
import {  Column, Entity } from 'typeorm';
import { AbstractBaseEntity } from '../../../utils/base-entity';

@Entity('UserSetting')
export class UserSettingEntity extends AbstractBaseEntity {
  
  @Column('uuid')
  userId: string;
  
  @Column({type: 'bool', default: false })
  autoSave: boolean;

  @Column({type: "enum", enum: SavingsFrequency, default: SavingsFrequency.DAILY})
  frequency: SavingsFrequency;

  @Column({type: "numeric", default: 0, precision: 10, scale: 2})
  amount: number;
  
  @Column({type: "enum", enum: SavingsDayOfTheWeek, default: SavingsDayOfTheWeek.MONDAYS})
  dayToSave: SavingsDayOfTheWeek;
  
  @Column({type: "enum", enum: TimeToSave, default: TimeToSave.FOUR_00_AM})
  timeToSave: TimeToSave;

  @Column('uuid')
  cardId: string;

  @Column({type: "int"})
  dayOfMonth: number;

  @Column({type: "enum", enum: WhenToStartSaving, default: WhenToStartSaving.NOW})
  whenToStart: WhenToStartSaving;

  @Column({ type: 'date', nullable: true})
  nextSaveDate: Date; 


}

