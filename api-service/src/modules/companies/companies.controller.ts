import {
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { ParseUrlPipe } from './url-parser.pipe';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('/getinformation')
  @HttpCode(200)
  async getCompanyInformation(@Query('url', ParseUrlPipe) url: string) {
    try {
      const result = await this.companiesService.getJobInformation(url);
      return {
        success: result,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
}
