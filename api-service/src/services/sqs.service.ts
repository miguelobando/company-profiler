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
    const isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';
    const endpoint = isDevelopment
      ? this.configService.get<string>('SQS_LOCALSTACK_URL')
      : undefined;

    this.sqsClient = new SQSClient({
      endpoint,
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });

    this.queueUrl = isDevelopment
      ? this.configService.get<string>('SQS_LOCALSTACK_URL')
      : this.configService.get<string>('SQS_REAL_URL');
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
