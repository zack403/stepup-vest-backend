import { Controller, Get, Body, Param, Req, Res, Put, UseGuards, Post} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AddBankDetailsDto } from './dto/add-bank-details.dto';

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

  
  @Get(':id')
  @ApiOperation({ summary: 'Get a user account' })
  @ApiResponse({ status: 200, description: 'Returns users account' })
  async findOne(@Res() res: Response, @Param('id') id: string):Promise<void> {
    const result = await this.userService.findOne(id);
    res.status(result.status).json(result);
  }

  
  @Put(':id')
  @ApiOperation({ summary: 'Update a user account' })
  @ApiResponse({ status: 200, description: 'Return user successfully updated' })
  async update(@Res() res: Response, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    const result = await this.userService.update(id, updateUserDto, req.user);
    res.status(result.status).json(result);
  }


 
}
