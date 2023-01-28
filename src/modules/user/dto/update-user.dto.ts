import { ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, Matches, MinLength, IsString, MaxLength, IsBoolean, IsOptional } from "class-validator";

export class UpdateUserDto {
    
    @IsString()
    @ApiProperty()
    @MinLength(3, {message: 'fullName should be minimum 3 characters long'})
    @MaxLength(50, {message: 'fullName should be maximum 70 characters long'})  
    @IsNotEmpty({message: 'fullName is required'})
    fullName: string;

    @IsString()
    @ApiProperty()
    @Matches(/^[0-9]*$/, {message: 'phoneNumber Number should be of type number'})
    @IsNotEmpty({message: 'phoneNumber is required'})
    phoneNumber: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Expose()
    locationId: string;

    @IsBoolean()
    @ApiProperty({default: false})
    @IsNotEmpty()
    isCoAdmin: boolean;
        
}
