import { Controller, Get, Body, Param, Req, Res, Put, UseGuards, Post} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { VerificationService } from './verification.service';

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
      @Body() bvn: string,
      @Req() req: any) : Promise<void> 
  {
    // const result = await this.verifySvc.verifyBVN(bvn, req.user);
    // res.status(result.status).json(result);
  }
 
}
