import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Req, 
  HttpStatus, 
  UseGuards, 
  Res
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiParam, 
  ApiResponse, 
  ApiTags 
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
  @Post('/create-account')
  @ApiOperation({summary: 'Create a new stepup vest account'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 201, description: 'User Successfully created' })
  async register(
      @Res() res: Response, 
      @Body() registrationDto: RegisterDto)
      : Promise<void> 
    {
    const result = await this.authService.register(registrationDto);
    res.status(result.status).json(result);
  }


  @Post('/login')
  @ApiOperation({summary: 'Authenticate a stepup vest user and sends back a token for subsequent request'})
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 200, description: 'Return user payload' })
  async logIn(@Res() res: Response, @Body() loginDto: LoginDto): Promise<void> {
    const result = await this.authService.login(loginDto);
    res.status(result.status).json(result);

  }

  @Get('/verify-email/:token')
  @ApiParam({name: 'token', required: true})
  @ApiOperation({summary: 'Verifies a stepup vest user email by token'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Res() res: Response, @Param() params: any): Promise<void> {
    const msg = await this.authService.verifyEmail(params.token)
    res.status(msg.status).json(msg);
  }

  @Get('/resend-verification/:email')
  @ApiOperation({summary: 'Resends an email verification to a stepup vest user email with a token'})
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({name: 'email', required: true})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Email Verification sent' })
  public async sendEmailVerification(@Param() params: any): Promise<any> {
      const data = await this.authService.createEmailToken(params.email);
      if(data) {
        const isEmailSent = await this.authService.sendVerificationEmail(params.email, data.data);
        if(isEmailSent){
          return {
            status: HttpStatus.OK,
            message: 'Verification email has been sent, kindly check your inbox'
          } 
        } 
      }
      
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'Email does not exist with us'
      } 
  }

  @Get('/forgot-password/:email')
  @ApiParam({name: 'email', required: true})
  @ApiOperation({summary: 'Sends an instructions on how to reset password to the email provided if the account exist'})
  @ApiResponse({ status: 200, description: 'Forgot password email sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  public async sendEmailForgotPassword(@Res() res: Response, @Param() params: any): Promise<void> {
    const result = await this.authService.sendEmailForgotPassword(params.email);
    res.status(result.status).json(result);
  }

  @Get('/valid-password-token/:token')
  @ApiParam({name: 'token', required: true})
  @ApiOperation({summary: 'Verifies the password token send to a stepup vest user email'})
  async validPasswordToken(@Res() res: Response, @Param() params: any): Promise<void> {
    const result =  await this.authService.isValidPasswordToken(params.token);
    res.status(result.status).json(result);
  }

  @Post('/reset-password')
  @ApiOperation({summary: 'Reset a Stepup vest user password'})
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Password Reset successful' })
  public async setNewPassord(@Res() res: Response, @Body() resetDto: ResetPasswordDto): Promise<void> {
    const result =  await this.authService.setNewPassord(resetDto);
    res.status(result.status).json(result);
  }

  @Post('/change-password')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiOperation({summary: 'To change a stepup vest user password'})
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Change Password successful' })
  public async changePassord(@Res() res: Response, @Body() changeDto: ChangePasswordDto, @Req() req: any): Promise<void> {
    const result = await this.authService.changedPassword(changeDto, req.user);
    res.status(result.status).json(result);
  }
}
