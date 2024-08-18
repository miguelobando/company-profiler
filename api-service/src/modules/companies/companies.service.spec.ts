import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { SqsService } from '../../services/sqs.service';
import { InternalServerErrorException } from '@nestjs/common';
import { LogService } from '../../services/log.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let sqsService: SqsService;
  let logService: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: SqsService,
          useValue: {
            sendMessage: jest.fn(),
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

    service = module.get<CompaniesService>(CompaniesService);
    sqsService = module.get<SqsService>(SqsService);
    logService = module.get<LogService>(LogService);
  });

  it('should call sendMessage with the correct URL and return true', async () => {
    const url = 'https://example.com';
    const userId = 'test-user';
    const sendMessageSpy = jest
      .spyOn(sqsService, 'sendMessage')
      .mockResolvedValue(undefined);

    jest.spyOn(logService, 'logMessage').mockImplementation(() => {
      return;
    });

    const result = await service.getJobInformation(url, userId);

    expect(sendMessageSpy).toHaveBeenCalledWith({ url, userId });
    expect(result).toBe(true);
  });

  it('should throw an InternalServerErrorException if sendMessage fails', async () => {
    const url = 'https://example.com';
    const userId = 'test-user';
    const errorMessage = 'AWS error';
    jest
      .spyOn(sqsService, 'sendMessage')
      .mockRejectedValue(new Error(errorMessage));

    await expect(service.getJobInformation(url, userId)).rejects.toThrow(
      InternalServerErrorException,
    );
    await expect(service.getJobInformation(url, userId)).rejects.toEqual(
      new InternalServerErrorException({
        message: 'Internal Server Error',
        error: errorMessage,
      }),
    );
  });
});
