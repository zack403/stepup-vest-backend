import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom, map } from "rxjs";
import { VerifyAccountDto } from "src/modules/verification/dto/verify-account.dto";
import { clientFeedback } from "./clientReturnfunction";

@Injectable()
export class HttpRequestService {

    constructor(private httpService: HttpService, private configSvc: ConfigService) {}

    payStackRequestHeaders = {
        headers: {
          Authorization: `Bearer ${this.configSvc.get("PAYSTACK_SECRET")}`,
        },
    };


    async getBanks() {
        try {
            const result = await lastValueFrom(this.httpService.get(
              `${this.configSvc.get("PAYSTACK_BASE_URL")}bank`,
              this.payStackRequestHeaders
            ).pipe(map(r => r.data)));

            if(result.status) {
                return result.data;
            }
          
        
          } catch (error) {
            console.log({error});
          }
    }


    async matchBVN(payload: any): Promise<any> {
        try {
            const result = await lastValueFrom(this.httpService.post(
                `${this.configSvc.get("PAYSTACK_BASE_URL")}bvn/match`, 
                payload,
                this.payStackRequestHeaders
              ).pipe(map(r => r.data)));
  
              if(result.status) {
            
                return result;  
              }
            
        } catch (error) {
            
            return clientFeedback({
                message:  `Something failed, ${error.response.data.message}`,
                status: 500,
                trace: error
            })
        }
    }

    async resolveAccount(payload: VerifyAccountDto): Promise<any> {
        try {
            const result = await lastValueFrom(this.httpService.get(
                `${this.configSvc.get("PAYSTACK_BASE_URL")}bank/resolve?account_number=${payload.accountNumber}&bank_code=${payload.bankCode}`,
                this.payStackRequestHeaders
              ).pipe(map(r => r.data)));
  
              if(result.status) {
            
                return result;  
              }
            
        } catch (error) {
            
            return clientFeedback({
                message:  `Something failed, ${error.response.data.message}`,
                status: 500,
                trace: error
            })
        }
    }

    async verifyPayment(ref): Promise<any> {
        try {
          const result = await lastValueFrom(this.httpService.get(
              `${this.configSvc.get("PAYSTACK_BASE_URL")}transaction/verify/${ref}`,
              this.payStackRequestHeaders
            ).pipe(map(r => r.data)));

            if(result.status) {
          
              return result;  
            }
          
          } catch (error) {
              
              return clientFeedback({
                  message:  `Something failed, ${error.response.data.message}`,
                  status: 500,
                  trace: error
              })
          }
    }

}