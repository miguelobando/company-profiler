import { Test, TestingModule } from '@nestjs/testing';
import { SqsService } from './sqs.service';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { LogService } from '../../services/log.service';

jest.mock('@aws-sdk/client-sqs');

describe('SqsService', () => {
  let service: SqsService;
  let sqsClient: SQSClient;
  let logService: LogService;

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
                case 'SQS_LOCALSTACK_URL':
                  return 'https://sqs.us-east-1.amazonaws.com/1234567891/scraping-ready-queue';
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
      ],
    }).compile();

    service = module.get<SqsService>(SqsService);
    logService = module.get<LogService>(LogService);
    sqsClient = service['sqsClient'];
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

  it('should poll the SQS queue and process messages', async () => {
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
  });

  it('should log an error if polling the SQS queue fails', async () => {
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
});
