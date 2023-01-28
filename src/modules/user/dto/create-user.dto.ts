import { ApiProperty} from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsEmail, Matches, MinLength, IsString, MaxLength, IsBoolean } from "class-validator";

export class CreateUserDto {
    
    @Expose()
    @IsEmail()
    @ApiProperty()
    @IsNotEmpty({message: 'email is required'})
    email: string;

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

    @ApiProperty()
    @IsNotEmpty({message: 'locationId cannot be empty'})
    locationId: string;

    @IsBoolean()
    @ApiProperty({default: false})
    @IsNotEmpty()
    isCoAdmin: boolean;
        
}
