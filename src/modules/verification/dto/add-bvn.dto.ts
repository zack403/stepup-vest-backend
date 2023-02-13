import { ApiProperty } from "@nestjs/swagger";
import { 
    IsNotEmpty, 
    IsString
} from "class-validator";

export class AddBVNDto {
        
    @IsString()
    @ApiProperty()  
    @IsNotEmpty()
    bvn: string;
        
}
