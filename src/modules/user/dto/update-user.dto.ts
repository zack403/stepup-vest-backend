import { ApiPropertyOptional} from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsOptional } from "class-validator";

export class UpdateUserDto {
    
    @ApiPropertyOptional()
    @IsOptional()
    @Expose()
    gender: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Expose()
    yearOfBirth: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Expose()
    salaryRange: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Expose()
    relationShipStatus: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Expose()
    employmentStatus: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Expose()
    address: string;
        
}
