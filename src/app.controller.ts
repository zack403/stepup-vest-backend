import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { clientFeedback } from './utils/clientReturnfunction';
import {Response} from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('banks')
  async getBanks(): Promise<any> {
    const res =  await this.appService.getBanks();

    return clientFeedback({
      status: 200,
      message: 'Bank fetched successfully',
      data: res
    })
  }

  @Post('on_paystack_events')
  async onPaystackEvents(@Res() res: Response, @Req() req: any) {
    const result = await this.appService.onPaystackEvents(req);
    res.send(result.status);
  }
}
