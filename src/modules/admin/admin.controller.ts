import { Controller, Body,  Req, Res, UseGuards, Post, Get} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { AdminSettingsDto } from './dto/setting.dto';


@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('admin')
export class AdminController {
  constructor(private admSvc: AdminService) {}


  @Post('/settings')
  @ApiOperation({summary: 'Updates settings'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'settings Successfully updated' })
  async verifyBVN(
      @Res() res: Response, 
      @Body() payload: AdminSettingsDto,
      @Req() req: any) : Promise<void> 
  {
    const result = await this.admSvc.updateSettings(payload, req.user);
    res.status(result.status).json(result);
  }

  @Get('savings-types')
  @ApiOperation({summary: 'Savings type returned successfully'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Savings type returned successfully' })
  async getSavingsType(
      @Res() res: Response,
      @Req() req: any) : Promise<void> 
  {
    const result = await this.admSvc.getSvaingsType(req.user);
    res.status(result.status).json(result);
  }
 
}
