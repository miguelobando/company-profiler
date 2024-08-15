import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SqsService } from '../../services/sqs.service';
import { LogService } from '../../services/log.service';

@Injectable()
export class CompaniesService {
  SERVICE_NAME = 'CompaniesService';
  constructor(
    private readonly sqsService: SqsService,
    private readonly logService: LogService,
  ) {}

  async getJobInformation(url: string) {
    try {
      await this.sqsService.sendMessage({ url });
      this.logService.logMessage(
        this.SERVICE_NAME,
        `Message sent to SQS with URL: ${url}`,
      );
      return true;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
}
