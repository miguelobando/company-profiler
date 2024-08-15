import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { SqsService } from '../../services/sqs.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let sqsService: SqsService;

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
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    sqsService = module.get<SqsService>(SqsService);
  });

  it('should call sendMessage with the correct URL and return true', async () => {
    const url = 'https://example.com';
    const sendMessageSpy = jest
      .spyOn(sqsService, 'sendMessage')
      .mockResolvedValue(undefined);

    const result = await service.getJobInformation(url);

    expect(sendMessageSpy).toHaveBeenCalledWith({ url });
    expect(result).toBe(true);
  });

  it('should throw an InternalServerErrorException if sendMessage fails', async () => {
    const url = 'https://example.com';
    const errorMessage = 'AWS error';
    jest
      .spyOn(sqsService, 'sendMessage')
      .mockRejectedValue(new Error(errorMessage));

    await expect(service.getJobInformation(url)).rejects.toThrow(
      InternalServerErrorException,
    );
    await expect(service.getJobInformation(url)).rejects.toEqual(
      new InternalServerErrorException({
        message: 'Internal Server Error',
        error: errorMessage,
      }),
    );
  });
});
