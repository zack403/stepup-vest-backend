import { Controller,  Req, Res, UseGuards, Get, Param, Query} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { SavingsService } from './savings.service';


@ApiTags('Savings')
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('savings')
export class SavingsController {
  constructor(private savSvc: SavingsService) {}

  

  @Get('/initiate-quicksave-refrence')
  @ApiQuery({name: 'amount', type: Number})
  @ApiQuery({name: 'savingTypeId', type: String})
  @ApiOperation({summary: 'Generates a quick save reference for users to make payment'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Quick save reference generated successfully' })
  async getQuickSaveReference(
      @Res() res: Response,
      @Query() query: any, 
      @Req() req: any) : Promise<void> 
  {
    const result = await this.savSvc.getQuickSaveReference(query, req.user);
    res.status(result.status).json(result);
  }

  
  @Get('savings-type')
  @ApiOperation({summary: 'Savings type returned successfully'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Savings returned successfully' })
  async getSavingsType(
      @Res() res: Response) : Promise<void> 
  {
    const result = await this.savSvc.getSavingsType();
    res.status(result.status).json(result);
  }

  @Get('/type/:slug')
  @ApiOperation({summary: 'Savings returned successfully'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Savings returned successfully' })
  async getSavingsByTypeSlug(
    @Param('slug') slug: string,
    @Req() req: any,
      @Res() res: Response) : Promise<void> 
  {
    const result = await this.savSvc.getSavingsByTypeSlug(req.user.id, slug);
    res.status(result.status).json(result);
  }


  @Get(':typeId')
  @ApiOperation({ summary: 'Get savings by type' })
  @ApiResponse({ status: 200, description: 'Returns saving by type' })
  async findOne(@Res() res: Response, @Param('typeId') typeId: string, @Req() req: any):Promise<any> {
    
    try {

      const result = await this.savSvc.getSavingsByType(req.user.id, typeId);

      res.status(200).json({
        status: 200,
        data: result,
        message: 'Fetched successfully'
      });
      
    } catch (error) {
      console.log(error);
    }
    
  }


  @Get()
  @ApiOperation({summary: 'Savings returned successfully'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Savings returned successfully' })
  async getSavings(
      @Res() res: Response,
      @Req() req: any) : Promise<void> 
  {
    const result = await this.savSvc.getSavings(req.user);
    res.status(result.status).json(result);
  }
 


 
}
