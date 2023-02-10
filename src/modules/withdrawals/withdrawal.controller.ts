import { Controller, Get, Body, Param, Req, Res, Put, UseGuards, Post, Delete, Query} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { WithdrawalService } from './withdrawal.service';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { RequestWithdrawlDto } from './dto/request-withdrawal.dto';
import { WithdrawalQuery } from './dto/withdrawal-query.dto';
import { BulkTransferDto } from './dto/bulk-transfer.dto';

@ApiTags('Withdrawal')
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('withdrawal')
export class WithdrawalController {
  constructor(private readonly withService: WithdrawalService) {}


  @Post('/request')
  @ApiOperation({summary: 'Request for withdrawal'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Withdrawal Successfully requested' })
  async requestWithdrawal(
      @Res() res: Response, 
      @Body() payload: RequestWithdrawlDto,
      @Req() req: any) : Promise<void> 
  {
    const result = await this.withService.requestWithdrawal(payload, req.user);
    res.status(result.status).json(result);
  }


  @Get()
  @ApiOperation({ summary: 'Get all withdrawals'})
  @ApiResponse({ status: 200, description: 'Return all withdrawals'})
  async findAll(@Res() res: Response, @Query() query: WithdrawalQuery,  @Req() req: any): Promise<void> {
  
    const result = await this.withService.findAll(query, req.user);
    res.status(result.status).json(result);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all my withdrawals'})
  @ApiResponse({ status: 200, description: 'Return all my withdrawals'})
  async findMyWithdrawals(@Res() res: Response, @Query() query: WithdrawalQuery,  @Req() req: any): Promise<void> {
  
    const result = await this.withService.findMyWithdrawals(query, req.user);
    res.status(result.status).json(result);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'delete a withdrawal'})
  @ApiResponse({ status: 200, description: 'Remove withdrawal'})
  async removeWithdrawal(@Res() res: Response, @Param('id') id: string, @Req() req: any): Promise<void> {
    const result = await this.withService.removeWithdrawal(id, req.user);
    res.status(result.status).json(result);
  }

  
  @Get(':id')
  @ApiOperation({ summary: 'Get a single withdrawal' })
  @ApiResponse({ status: 200, description: 'Returns withdrawal' })
  async findOne(@Res() res: Response, @Param('id') id: string):Promise<void> {
    const result = await this.withService.findOne(id);
    res.status(result.status).json(result);
  }

  
  @Put(':id')
  @ApiOperation({ summary: 'Update a withdrawal' })
  @ApiResponse({ status: 200, description: 'Return withdrawal successfully updated' })
  async update(
    @Res() res: Response, 
    @Body() request: UpdateWithdrawalDto, 
    @Param('id') id: string, 
    @Req() req: any) {
    const result = await this.withService.update(id, request, req.user);
    res.status(result.status).json(result);
  }

  @Put('approve/:id')
  @ApiOperation({ summary: 'Approve a withdrawal' })
  @ApiResponse({ status: 200, description: 'Return withdrawal successfully approved' })
  async approve(
    @Res() res: Response,
    @Param('id') id: string, 
    @Req() req: any) {
    const result = await this.withService.approve(id, req.user);
    res.status(result.status).json(result);
  }

  @Put('/single-transfer/:withdrawalId')
  @ApiOperation({summary: 'Initiate a single transfer'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Single Transfer successfully initiated' })
  async singleTransfer(
      @Res() res: Response, 
      @Param('withdrawalId') withdrawalId: string,
      @Req() req: any) : Promise<void> 
  {
    const result = await this.withService.singleTransfer(withdrawalId, req.user);
    res.status(result.status).json(result);
  }

  // @Put('/bulk-transfer')
  // @ApiOperation({summary: 'Initiate a bulk transfer'})
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // @ApiResponse({ status: 201, description: 'Bulk Transfer successfully initiated' })
  // async bulkTransfer(
  //     @Res() res: Response, 
  //     @Body() payload: BulkTransferDto,
  //     @Req() req: any) : Promise<void> 
  // {
  //   const result = await this.withService.bulkTransfer(payload, req.user);
  //   res.status(result.status).json(result);
  // }


}
