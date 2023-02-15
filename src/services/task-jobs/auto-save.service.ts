import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SavingsService } from 'src/modules/savings/savings.service';
import { DataSource } from 'typeorm';

@Injectable()
export class AutoSaveService {
  private readonly logger = new Logger(AutoSaveService.name);

  constructor(
    private savingSvc: SavingsService,
    private dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handle() {
    this.logger.log('Auto saving service started');
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.savingSvc.runAutoSave(queryRunner);
    } catch (error) {
      this.logger.error(`Error in auto saving - ${error.message}`);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
