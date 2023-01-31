import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpRequestService } from './utils/http-request';

@Injectable()
export class AppService {

  constructor(private httpReqSvc: HttpRequestService) {

  }

  getHello(): string {
    return 'Welcome to Stepup Vest api!';
  }

  async getBanks() {
    return await this.httpReqSvc.getBanks();
  }
}
