import { Controller, Body,  Req, Res, UseGuards, Post, Get, Param} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { SavingsService } from './savings.service';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { IClientReturnObject } from 'src/types/clientReturnObj';


@ApiTags('Savings')
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('savings')
export class SavingsController {
  constructor(private savSvc: SavingsService) {}

  
  @Get(':typeId')
  @ApiOperation({ summary: 'Get saving by typet' })
  @ApiResponse({ status: 200, description: 'Returns saving by type' })
  async findOne(@Res() res: Response, @Param('typeId') typeId: string, @Req() req: any):Promise<IClientReturnObject> {
    
    try {

      const result = await this.savSvc.getSavingsByType(req.user, typeId);
    
      return clientFeedback({
        status: 200,
        data: result,
        message: 'Fetched successfully'
      })
      
    } catch (error) {
      console.log(error);
    }
    
  }


  @Get()
  @ApiOperation({summary: 'Savings returned successfully'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Savings returned successfully' })
  async getSavingsType(
      @Res() res: Response,
      @Req() req: any) : Promise<void> 
  {
    const result = await this.savSvc.getSavings(req.user);
    res.status(result.status).json(result);
  }
 
 



 
}
