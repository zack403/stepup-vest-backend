import { Controller, Get, Body, Param, Req, Res, Put, UseGuards, Post} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { VerificationService } from './verification.service';
import { AddBVNDto } from './dto/add-bvn.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { ModeType } from 'src/utils/enum';

@ApiTags('Verification')
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('verify')
export class VerificationController {
  constructor(private verifySvc: VerificationService) {}


  @Post('/bvn')
  @ApiOperation({summary: 'Verifies users bvn'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'BVN Successfully verified' })
  async verifyBVN(
      @Res() res: Response, 
      @Body() payload: AddBVNDto,
      @Req() req: any) : Promise<void> 
  {
    const result = await this.verifySvc.verifyBVN(payload.bvn, req.user);
    res.status(result.status).json(result);
  }

  @Post('/resolve-account')
  @ApiOperation({summary: 'Resolve users account number'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Account Number Successfully resolved' })
  async verifyAccount(
      @Res() res: Response, 
      @Body() payload: VerifyAccountDto,
      @Req() req: any) : Promise<void> 
  {
    const result = await this.verifySvc.verifyAccount(payload, req.user);
    res.status(result.status).json(result);
  }

  @Get('payment/:reference_code')
  @ApiParam({ name: 'reference_code', type: String})
  @ApiOkResponse({ description: 'The payment was successfully' })
  @ApiBadRequestResponse({ description: 'The pay failed' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error, check the response body' })
  async verifypayment(@Res() res: Response, @Req() req: any, @Param() param: any) {
    
      const result = await this.verifySvc.verifyPayment(param['reference_code'], req.user);
      res.status(result.status).json(result)
  }

  @Get('reconcile-payment/:reference_code')
  @ApiParam({ name: 'reference_code', type: String})
  @ApiOkResponse({ description: 'Confirm if payment was successfull and do necessary reconciliation' })
  @ApiBadRequestResponse({ description: 'The pay failed' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error, check the response body' })
  async reconcilePayment(@Res() res: Response, @Req() req: any, @Param() param: any) {
    
      const result = await this.verifySvc.reconcilePayment(param['reference_code'], req.user);
      res.status(result.status).json(result)
  }
 
}
