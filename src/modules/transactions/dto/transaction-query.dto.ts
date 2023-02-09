import {  ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { TransactionType } from "src/utils/enum";
import { GeneralQueryParams } from "src/utils/general-query-param";


export class TransactionQuery extends OmitType(GeneralQueryParams, ['search'] as const)  {

    @ApiPropertyOptional({enum: TransactionType})
    @IsEnum(TransactionType)
    @IsOptional()
    transactionType: TransactionType;


}