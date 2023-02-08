import { ApiProperty } from "@nestjs/swagger";
import { 
    IsNotEmpty, 
    IsString, 
    IsNumber
} from "class-validator";

export class UpdateWithdrawalDto {
        
    @ApiProperty()  
    @IsNumber()
    amountToWithdraw: number;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    savingsTypeId: string;
        
}
