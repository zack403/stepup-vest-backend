import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { lastValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';
import { IClientReturnObject } from './types/clientReturnObj';
import { clientFeedback } from './utils/clientReturnfunction';
import { HttpRequestService } from './utils/http-request';

@Injectable()
export class AppService {

  logger = new Logger('AppService')

  constructor(
    private httpReqSvc: HttpRequestService,
    private configService: ConfigService, 
    private dataSource: DataSource) {

  }

  getHello(): string {
    return 'Welcome to Stepup Vest api!';
  }

  async getBanks() {
    return await this.httpReqSvc.getBanks();
  }

  async onPaystackEvents(req: any): Promise<IClientReturnObject> {
    const dataSource = this.dataSource.createQueryRunner();
    try {

      await dataSource.connect();
      await dataSource.startTransaction();

      const hash = createHmac('sha512', `${this.configService.get('PAYSTACK_SECRET')}`).update(JSON.stringify(req.body)).digest('hex');
      if (hash == req.headers['x-paystack-signature']) {

        // Retrieve the request's body
        const response = req.body;
        if (response.event === 'charge.success') {
            const result = response.data;

            await dataSource.commitTransaction();

            return clientFeedback({
              status: 200,
              message: `Your payment was successful`
            })
          }
          
      }

    } catch (error) {
      
      await dataSource.rollbackTransaction();
      return clientFeedback({
        status: 500,
        message: error.message,
        trace: error,
      })

    } finally {
      await dataSource.release();
    }
  }
}
