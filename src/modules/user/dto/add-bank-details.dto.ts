import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { 
    IsNotEmpty, 
    IsString, 
    IsOptional 
} from "class-validator";

export class AddBankDetailsDto {
        
    @IsString()
    @ApiProperty()  
    @IsNotEmpty()
    bankName: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    accountName: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    bankCode: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    accountNumber: string;

    @ApiProperty()
    @IsOptional()
    @ApiPropertyOptional()
    accountType: string;
        
}
