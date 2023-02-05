import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class GeneralQueryParams  {

    @ApiPropertyOptional({default: 1})
    @IsNotEmpty()
    @Type(() => Number)
    page: number;

    @ApiPropertyOptional({default: 15})
    @IsOptional()
    @Type(() => Number)
    limit: number;
}