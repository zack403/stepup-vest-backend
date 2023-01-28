import { ApiProperty} from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsEmail, IsArray } from "class-validator";

export class AddAdminDto {
    
    @Expose()
    @IsEmail()
    @ApiProperty()
    @IsNotEmpty({message: 'email is required'})
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    roles: string[];

        
}
