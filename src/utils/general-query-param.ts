import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class GeneralQueryParams  {

    @ApiPropertyOptional({default: 1})
    @IsNotEmpty()
    page: number;

    @ApiPropertyOptional({default: 15})
    @IsOptional()
    limit: number;
}