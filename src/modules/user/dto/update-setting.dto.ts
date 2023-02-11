import { ApiProperty} from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, min, minLength } from "class-validator";
import { SavingsDayOfTheWeek, SavingsFrequency, TimeToSave, WhenToStartSaving } from "src/utils/enum";

export class UpdateUserSettingDto {
    

    @IsBoolean()
    @ApiProperty({default: false})
    @IsNotEmpty()
    autoSave: boolean;

    @ApiProperty({enum: SavingsFrequency})
    @IsString()
    @IsEnum(SavingsFrequency)
    @IsNotEmpty()
    frequency: SavingsFrequency;

    @ApiProperty({default: 1})
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({enum: SavingsDayOfTheWeek})
    @IsNotEmpty()
    @IsEnum(SavingsDayOfTheWeek)
    dayToSave: SavingsDayOfTheWeek;

    @ApiProperty({enum: TimeToSave})
    @IsNotEmpty()
    @IsString()
    @IsEnum(TimeToSave)
    timeToSave: TimeToSave;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    cardId: string;

    @ApiProperty({default: 1})  
    @IsNotEmpty()
    @IsNumber()
    dayOfMonth: number;

    @ApiProperty({enum: WhenToStartSaving})
    @IsString()
    @IsNotEmpty()
    @IsEnum(WhenToStartSaving)
    whenToStart: WhenToStartSaving;

}
