import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { 
    IsNotEmpty, 
    IsEmail, Matches, 
    MinLength, 
    IsString, 
    MaxLength, 
    IsOptional 
} from "class-validator";
import { MustMatch } from "../../../utils/must-match";

export class RegisterDto {
    
    @Expose()
    @IsEmail()
    @ApiProperty()
    @IsNotEmpty()
    email: string;

    @IsString()
    @ApiProperty()
    @MinLength(3, {message: 'fullName should be minimum 3 characters long'})
    @MaxLength(50, {message: 'fullName should be maximum 70 characters long'})  
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    heardAboutUs: string;
    
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'Password too weak. Should contain uppercase letter, one special character and alphanumeric characters' })
    @IsNotEmpty({message: 'Password is required'}) 
    @MinLength(8, {message: 'Password should be minimum 8 characters long'}) 
    @ApiProperty() 
    password: string;

    @IsNotEmpty({message: 'Confirm Password is required'})
    @MustMatch('password') 
    @ApiProperty() 
    confirmPassword: string;

    @ApiProperty()
    @IsOptional()
    @ApiPropertyOptional()
    referralCode: string;
        
}
