import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { clientFeedback } from './utils/clientReturnfunction';

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
}
