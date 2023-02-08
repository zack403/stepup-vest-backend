import { ApiProperty } from "@nestjs/swagger";
import { 
    IsNotEmpty, 
    IsString, 
    IsNumber
} from "class-validator";

export class RequestWithdrawlDto {
        
    @ApiProperty()  
    @IsNumber()
    amountToWithdraw: number;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    savingsTypeId: string;
        
}
