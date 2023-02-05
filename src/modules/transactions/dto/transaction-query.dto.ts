import {  ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { TransactionType } from "src/utils/enum";
import { GeneralQueryParams } from "src/utils/general-query-param";


export class TransactionQuery extends GeneralQueryParams  {

    @ApiPropertyOptional({enum: TransactionType})
    @IsEnum(TransactionType)
    @IsOptional()
    transactionType: TransactionType;


}