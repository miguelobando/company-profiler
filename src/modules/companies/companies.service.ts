import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SqsService } from '../../services/sqs.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly sqsService: SqsService) {}

  async getJobInformation(url: string) {
    try {
      await this.sqsService.sendMessage({ url });
      return true;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
}
