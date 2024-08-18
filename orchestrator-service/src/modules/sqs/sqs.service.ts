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
    this.sqsClient = new SQSClient({
      region: this.configService.get<string>('AWS_REGION'),
    });

    this.queueUrl = this.configService.get<string>('SQS_URL');
  }

  onModuleInit() {
    this.startPolling();
  }

  onModuleDestroy() {
    clearInterval(this.pollingInterval);
  }

  private startPolling() {
    this.pollingInterval = setInterval(async () => {
      await this.pollInformationGetterQueue();
    }, 5000); // Get messages every 5 seconds
  }

  private async pollInformationGetterQueue() {
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
