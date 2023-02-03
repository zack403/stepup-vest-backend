import { Controller,  Body,  Req, Res, UseGuards, Post, Get} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { TransactionService } from './transaction.service';

@ApiTags('Transaction')
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('transaction')
export class TransactionController {
  constructor(private trSvc: TransactionService) {}


  @Get('/initiate-payment-refrence')
  @ApiOperation({summary: 'Generates a payment reference for users to make payment'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Payment reference generated successfully' })
  async getPaymentReference(
      @Res() res: Response, 
      @Req() req: any) : Promise<void> 
  {
    const result = await this.trSvc.getPaymentReference(req.user);
    res.status(result.status).json(result);
  }
 
}
