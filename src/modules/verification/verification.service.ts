import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IClientReturnObject } from 'src/types/clientReturnObj';
import { clientFeedback } from 'src/utils/clientReturnfunction';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class VerificationService {

  logger = new Logger('UserService');

  constructor() {}


}
