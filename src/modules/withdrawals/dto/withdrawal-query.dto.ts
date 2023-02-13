import {  ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import {  IsEnum, IsOptional } from "class-validator";
import {  WithdrawalStatus } from "src/utils/enum";
import { GeneralQueryParams } from "src/utils/general-query-param";


export class WithdrawalQuery extends OmitType(GeneralQueryParams, ['search'] as const)  {

    @ApiPropertyOptional({enum: WithdrawalStatus})
    @IsEnum(WithdrawalStatus)
    @IsOptional()
    status: WithdrawalStatus;

}