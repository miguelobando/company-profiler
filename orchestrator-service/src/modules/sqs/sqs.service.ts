import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { LogService } from '../../services/log.service';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { HttpService } from '@nestjs/axios';
import { MessageInterface } from './message.interface';

@Injectable()
export class SqsService implements OnModuleInit, OnModuleDestroy {
  private sqsClient: SQSClient;
  private snsClient: SNSClient;
  private informationGetterURL: string;
  private scrapingReadyURL: string;
  private pollingInterval: NodeJS.Timeout;
  private MODULE_NAME = 'SqsService';
  private scrapingReadyTopic: string;
  private scrapingEntryPoint: string;

  constructor(
    private configService: ConfigService,
    private readonly logService: LogService,
    private readonly httpService: HttpService,
  ) {
    this.sqsClient = new SQSClient({
      region: this.configService.get<string>('AWS_REGION'),
    });

    this.snsClient = new SNSClient({
      region: this.configService.get<string>('AWS_REGION'),
    });

    this.informationGetterURL = this.configService.get<string>(
      'INFORMATION_GETTER_QUEUE_URL',
    );

    this.scrapingReadyURL = this.configService.get<string>(
      'SCRAPING_READY_QUEUE_URL',
    );

    this.scrapingReadyTopic = this.configService.get<string>(
      'SCRAPING_READY_TOPIC_ARN',
    );
    this.scrapingEntryPoint =
      this.configService.get<string>('SCRAPER_ENDPOINT');
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
      await this.pollScrapingReadyQueue();
    }, 5000); // Get messages every 5 seconds
  }

  private async pollInformationGetterQueue() {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.informationGetterURL,
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

          const { userId, url } = this.transformBodyFromRequestInfoQueue(
            message.Body,
          );
          this.httpService.axiosRef.post(
            `${this.scrapingEntryPoint}/company-values`,
            {
              url: url,
              userId: userId,
            },
          );

          const deleteCommand = new DeleteMessageCommand({
            QueueUrl: this.informationGetterURL,
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

  private async pollScrapingReadyQueue() {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.scrapingReadyURL,
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

          const publishCommand = new PublishCommand({
            TopicArn: this.scrapingReadyTopic,
            Message: message.Body,
          });

          // Generic message, need to refine it
          await this.snsClient.send(publishCommand);

          // Delete the queue message after processing
          const deleteCommand = new DeleteMessageCommand({
            QueueUrl: this.scrapingReadyURL,
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

  private transformBodyFromRequestInfoQueue(body: string) {
    const newbody = JSON.parse(body) as unknown as MessageInterface;
    const { userId, url } = newbody;
    return { userId, url };
  }
}
