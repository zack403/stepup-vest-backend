import { ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, min, minLength } from "class-validator";
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

    @ApiPropertyOptional({enum: SavingsDayOfTheWeek})
    @IsOptional()
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

    @ApiPropertyOptional({default: 1})  
    @IsOptional()
    dayOfMonth: number;

    @ApiProperty({enum: WhenToStartSaving})
    @IsString()
    @IsNotEmpty()
    @IsEnum(WhenToStartSaving)
    whenToStart: WhenToStartSaving;

}
