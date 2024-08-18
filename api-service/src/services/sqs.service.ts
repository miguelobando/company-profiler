import { Injectable } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { SendUrlToScrapeDto } from './dto/sendUrlToScrape.dto';
import { LogService } from './log.service';

@Injectable()
export class SqsService {
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor(
    private configService: ConfigService,
    private readonly logService: LogService,
  ) {
    this.sqsClient = new SQSClient({
      region: this.configService.get<string>('AWS_REGION'),
    });

    this.queueUrl = this.configService.get<string>(
      'INFORMATION_GETTER_QUEUE_URL',
    );
  }

  async sendMessage(message: SendUrlToScrapeDto): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
    });

    try {
      await this.sqsClient.send(command);
    } catch (error) {
      this.logService.logError('SqsService', error.message);
      throw new Error('Error sending message to SQS');
    }
  }
}
