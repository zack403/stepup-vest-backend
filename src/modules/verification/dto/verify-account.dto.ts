import { ApiProperty } from "@nestjs/swagger";
import { 
    IsNotEmpty, 
    IsString
} from "class-validator";

export class VerifyAccountDto {
        
    @IsString()
    @ApiProperty()  
    @IsNotEmpty()
    accountNumber: string;

    @IsString()
    @ApiProperty()  
    @IsNotEmpty()
    bankCode: string;
        
}
