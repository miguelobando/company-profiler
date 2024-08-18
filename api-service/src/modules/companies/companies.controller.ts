import {
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { ParseUrlPipe } from './url-parser.pipe';
import { DynamoDBService } from '../../services/dynamodb.service';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly dynamodbService: DynamoDBService,
  ) {}

  @Get('/getinformation')
  @HttpCode(200)
  async getCompanyInformation(
    @Query('url', ParseUrlPipe) url: string,
    @Query('userId') userId: string,
  ) {
    try {
      const dbid = `${userId}-${url}`;
      const dbresult = await this.dynamodbService.getItem(dbid);
      if (dbresult) {
        return dbresult;
      } else {
        const result = await this.companiesService.getJobInformation(
          url,
          userId,
        );
        return {
          success: result,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
}
