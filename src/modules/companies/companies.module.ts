import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { SqsService } from 'src/services/sqs.service';
import { LogService } from 'src/services/log.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, SqsService, LogService],
})
export class CompaniesModule {}
