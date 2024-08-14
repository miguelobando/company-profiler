import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { ParseUrlPipe } from './url-parser.pipe';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('/getinformation')
  @HttpCode(200)
  async getCompanyInformation(@Query('url', ParseUrlPipe) url: string) {
    return {
      success: this.companiesService.getJobInformation(url),
    };
  }
}
