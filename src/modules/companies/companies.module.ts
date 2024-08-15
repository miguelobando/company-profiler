import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { SqsService } from 'src/services/sqs.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, SqsService],
})
export class CompaniesModule {}
