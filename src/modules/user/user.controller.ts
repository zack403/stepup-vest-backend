import { Controller, Get, Body, Param, Req, Res, Put, UseGuards} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}



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
