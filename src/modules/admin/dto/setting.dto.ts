import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty} from "class-validator";

export class AdminSettingsDto {
        
    @ApiProperty()  
    @IsNotEmpty()
    referralAmount: number;

    @ApiProperty()  
    @IsNotEmpty()
    percentageChargeOnWithdrawals: number;
        
}
