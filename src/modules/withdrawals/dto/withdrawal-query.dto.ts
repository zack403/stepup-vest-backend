import {  ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { TransactionStatus } from "src/utils/enum";
import { GeneralQueryParams } from "src/utils/general-query-param";


export class WithdrawalQuery extends OmitType(GeneralQueryParams, ['search'] as const)  {

    @ApiPropertyOptional({enum: TransactionStatus})
    @IsEnum(TransactionStatus)
    @IsOptional()
    status: TransactionStatus;

}