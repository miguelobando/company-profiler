import { Test, TestingModule } from '@nestjs/testing';
import { SqsService } from './sqs.service';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { LogService } from '../../services/log.service';
import { HttpService } from '@nestjs/axios';

jest.mock('@aws-sdk/client-sqs');
jest.mock('@aws-sdk/client-sns');

describe('SqsService', () => {
  let service: SqsService;
  let sqsClient: SQSClient;
  let snsClient: SNSClient;
  let logService: LogService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'AWS_REGION':
                  return 'us-east-1';
                case 'INFORMATION_GETTER_QUEUE_URL':
                  return 'https://sqs.us-east-1.amazonaws.com/123456789/information-getter-queue';
                case 'AWS_SECRET_ACCESS_KEY':
                  return 'test-secret-key';
                case 'SCRAPING_READY_QUEUE_URL':
                  return 'https://sqs.us-east-1.amazonaws.com/1234567891/scraping-ready-queue';
                case 'SCRAPING_READY_TOPIC_URL':
                  return 'https://sns.us-east-1.amazonaws.com/000000000000/scraping-ready-topic';
                case 'SCRAPING_READY_ENTRYPOINT':
                  return 'https://scraping-ready-endpoint';
                default:
                  return null;
              }
            }),
          },
        },
        {
          provide: LogService,
          useValue: {
            logMessage: jest.fn(),
            logError: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SqsService>(SqsService);
    logService = module.get<LogService>(LogService);
    sqsClient = service['sqsClient'];
    snsClient = service['snsClient'];
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should start polling on module init and stop on module destroy', () => {
    const startPollingSpy = jest.spyOn<any, any>(service, 'startPolling');
    service.onModuleInit();
    expect(startPollingSpy).toHaveBeenCalled();

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    service.onModuleDestroy();
    expect(clearIntervalSpy).toHaveBeenCalledWith(service['pollingInterval']);
  });

  it('should poll the information getter queue and process messages', async () => {
    const messages = [
      { Body: 'test message', ReceiptHandle: 'test-receipt-handle' },
    ];

    jest
      .spyOn(sqsClient, 'send')
      .mockImplementationOnce(() => Promise.resolve({ Messages: messages }))
      .mockImplementationOnce(() => Promise.resolve({}));

    const pollQueueSpy = jest.spyOn<any, any>(
      service,
      'pollInformationGetterQueue',
    );

    const postSpy = jest.spyOn(httpService, 'post');

    await service['pollInformationGetterQueue']();

    expect(pollQueueSpy).toHaveBeenCalled();
    expect(sqsClient.send).toHaveBeenCalledWith(
      expect.any(ReceiveMessageCommand),
    );
    expect(sqsClient.send).toHaveBeenCalledWith(
      expect.any(DeleteMessageCommand),
    );
    expect(logService.logMessage).toHaveBeenCalledWith(
      'SqsService',
      'Received message: test message',
    );

    expect(postSpy).toHaveBeenCalledTimes(1);
  });

  it('should log an error if polling in the information getter queue fails', async () => {
    const error = new Error('AWS error');

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(sqsClient, 'send').mockImplementationOnce(() => {
      return Promise.reject(error) as any;
    });

    const pollQueueSpy = jest.spyOn<any, any>(
      service,
      'pollInformationGetterQueue',
    );

    await service['pollInformationGetterQueue']();

    expect(pollQueueSpy).toHaveBeenCalled();
    expect(sqsClient.send).toHaveBeenCalledWith(
      expect.any(ReceiveMessageCommand),
    );
    expect(logService.logError).toHaveBeenCalledWith(
      'SqsService',
      error.message,
    );
  });

  it('should poll the scraping ready queue, publish to SNS, and delete messages', async () => {
    const messages = [
      { Body: 'scraping ready message', ReceiptHandle: 'test-receipt-handle' },
    ];

    jest
      .spyOn(sqsClient, 'send')
      .mockImplementationOnce(() => Promise.resolve({ Messages: messages }))
      .mockImplementationOnce(() => Promise.resolve({}));

    jest
      .spyOn(snsClient, 'send')
      .mockImplementationOnce(() => Promise.resolve({}));

    const pollQueueSpy = jest.spyOn<any, any>(
      service,
      'pollScrapingReadyQueue',
    );

    await service['pollScrapingReadyQueue']();

    expect(pollQueueSpy).toHaveBeenCalled();
    expect(sqsClient.send).toHaveBeenCalledWith(
      expect.any(ReceiveMessageCommand),
    );
    expect(snsClient.send).toHaveBeenCalledWith(expect.any(PublishCommand));
    expect(sqsClient.send).toHaveBeenCalledWith(
      expect.any(DeleteMessageCommand),
    );
    expect(logService.logMessage).toHaveBeenCalledWith(
      'SqsService',
      'Received message: scraping ready message',
    );
  });

  it('should log an error if polling the scraping ready queue fails', async () => {
    const error = new Error('AWS error');

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(sqsClient, 'send').mockImplementationOnce(() => {
      return Promise.reject(error) as any;
    });

    const pollQueueSpy = jest.spyOn<any, any>(
      service,
      'pollScrapingReadyQueue',
    );

    await service['pollScrapingReadyQueue']();

    expect(pollQueueSpy).toHaveBeenCalled();
    expect(sqsClient.send).toHaveBeenCalledWith(
      expect.any(ReceiveMessageCommand),
    );
    expect(logService.logError).toHaveBeenCalledWith(
      'SqsService',
      error.message,
    );
  });
});
