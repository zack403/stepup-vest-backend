import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsArray } from "class-validator";

export class BulkTransferDto {
    
    @Expose()
    @IsNotEmpty()
    @ApiProperty() 
    @IsArray()
    withdrawalIds: string[];

        
}