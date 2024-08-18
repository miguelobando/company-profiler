import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { SqsService } from '../../services/sqs.service';
import { LogService } from '../../services/log.service';
import { DynamoDBService } from 'src/services/dynamodb.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [CompaniesController],
  providers: [
    CompaniesService,
    SqsService,
    LogService,
    DynamoDBService,
    ConfigService,
  ],
})
export class CompaniesModule {}
