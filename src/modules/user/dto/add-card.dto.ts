import { ApiProperty } from "@nestjs/swagger";
import { 
    IsBoolean,
    IsNotEmpty, 
    IsString 
} from "class-validator";

export class AddCardDto {
        
    @IsString()
    @ApiProperty()  
    @IsNotEmpty()
    email: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    authorizatioCode: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    last4: string;
    
    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    cardType: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    expMonth: string;


    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    expYear: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    bin: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    bank: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    channel: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    signature: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    countryCode: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    accountName: string;

    @IsString()
    @ApiProperty()
    @IsBoolean()
    reusable: boolean;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    createdBy: string;

  
        
}
