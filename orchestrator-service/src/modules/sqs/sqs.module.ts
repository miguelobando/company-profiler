import { Module } from '@nestjs/common';
import { SqsService } from './sqs.service';
import { LogService } from 'src/services/log.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [SqsService, LogService],
  imports: [HttpModule],
})
export class SqsModule {}
