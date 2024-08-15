import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { LogService } from '../../services/log.service';

@Injectable()
export class SqsService implements OnModuleInit, OnModuleDestroy {
  private sqsClient: SQSClient;
  private queueUrl: string;
  private pollingInterval: NodeJS.Timeout;
  private MODULE_NAME = 'SqsService';
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
      region: this.configService.get<string>('AWS_REGION'),
      endpoint,
    });

    this.queueUrl = isDevelopment
      ? `${this.configService.get<string>('SQS_LOCALSTACK_URL')}`
      : this.configService.get<string>('SQS_REAL_URL');
  }

  onModuleInit() {
    this.startPolling();
  }

  onModuleDestroy() {
    clearInterval(this.pollingInterval);
  }

  private startPolling() {
    this.pollingInterval = setInterval(async () => {
      await this.pollQueue();
    }, 5000); // Get messages every 5 seconds
  }

  private async pollQueue() {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      });
      const response = await this.sqsClient.send(command);

      if (response.Messages) {
        for (const message of response.Messages) {
          this.logService.logMessage(
            this.MODULE_NAME,
            `Received message: ${message.Body}`,
          );

          // Delete the message after processing
          const deleteCommand = new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: message.ReceiptHandle,
          });
          await this.sqsClient.send(deleteCommand);
        }
      }
    } catch (error) {
      this.logService.logError(this.MODULE_NAME, error.message);
      console.error('Error polling SQS queue:', error);
    }
  }
}
