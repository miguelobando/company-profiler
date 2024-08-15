import { Module } from '@nestjs/common';
import { SqsService } from './sqs.service';
import { LogService } from 'src/services/log.service';

@Module({
  providers: [SqsService, LogService],
})
export class SqsModule {}
