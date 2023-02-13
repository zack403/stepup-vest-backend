import { Controller, Get, Body, Param, Req, Res, Put, UseGuards, Post, Delete} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AddBankDetailsDto } from './dto/add-bank-details.dto';
import { UpdateUserSettingDto } from './dto/update-setting.dto';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Post('/bank-details')
  @ApiOperation({summary: 'Add users bank details'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Bank Successfully added' })
  async addBankDetails(
      @Res() res: Response, 
      @Body() payload: AddBankDetailsDto,
      @Req() req: any) : Promise<void> 
  {
    const result = await this.userService.addBankDetails(payload, req.user);
    res.status(result.status).json(result);
  }

  @Get('/bank-details')
  @ApiOperation({summary: 'fetch users bank details'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'Bank Successfully fetched' })
  async getBankDetails(
      @Res() res: Response,
      @Req() req: any) : Promise<void> 
  {
    const result = await this.userService.getBankDetails(req.user);
    res.status(result.status).json(result);
  }


  @Get()
  @ApiOperation({ summary: 'Get all users accounts'})
  @ApiResponse({ status: 200, description: 'Return all users accounts'})
  async findAll(@Res() res: Response,  @Req() req: any): Promise<void> {
  
    const result = await this.userService.findAll(req.user);
    res.status(result.status).json(result);
  }

  @Get('cards')
  @ApiOperation({ summary: 'Get all my cards'})
  @ApiResponse({ status: 200, description: 'Return all my cards'})
  async getCards(@Res() res: Response,  @Req() req: any): Promise<void> {
    const result = await this.userService.getCards(req.user);
    res.status(result.status).json(result);
  }

  @Get('setting')
  @ApiOperation({ summary: 'Get my setting'})
  @ApiResponse({ status: 200, description: 'Return my setting'})
  async getSetting(@Res() res: Response,  @Req() req: any): Promise<void> {
    const result = await this.userService.getSetting(req.user);
    res.status(result.status).json(result);
  }

  @Delete('card/:cardId')
  @ApiOperation({ summary: 'remove a card'})
  @ApiResponse({ status: 200, description: 'Remove card'})
  async removeCard(@Res() res: Response, @Param('cardId') cardId: string, @Req() req: any): Promise<void> {
    const result = await this.userService.removeCard(cardId, req.user);
    res.status(result.status).json(result);
  }

  
  @Get('dashboard/statistics')
  @ApiOperation({ summary: 'Get all my transaction and savings balance statistics on dashboard'})
  @ApiResponse({ status: 200, description: 'Return all all my transaction and savings balance statistics on dashboard'})
  async getStats(@Res() res: Response,  @Req() req: any): Promise<void> {
    const result = await this.userService.getStats(req.user);
    res.status(result.status).json(result);
  }

  
  @Get(':id')
  @ApiOperation({ summary: 'Get a user account' })
  @ApiResponse({ status: 200, description: 'Returns users account' })
  async findOne(@Res() res: Response, @Param('id') id: string):Promise<void> {
    const result = await this.userService.findOne(id);
    res.status(result.status).json(result);
  }

  
  @Put()
  @ApiOperation({ summary: 'Update a user account' })
  @ApiResponse({ status: 200, description: 'Return user successfully updated' })
  async update(@Res() res: Response, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    const result = await this.userService.update(updateUserDto, req.user);
    res.status(result.status).json(result);
  }

  @Put('setting')
  @ApiOperation({ summary: 'Update a user setting' })
  @ApiResponse({ status: 200, description: 'Return user setting successfully updated' })
  async updateSetting(@Res() res: Response, @Body() payload: UpdateUserSettingDto, @Req() req: any) {
    const result = await this.userService.updateSetting(payload, req.user);
    res.status(result.status).json(result);
  }

}
