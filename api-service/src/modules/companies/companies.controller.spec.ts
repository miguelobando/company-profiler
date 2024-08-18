import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DynamoDBService } from '../../services/dynamodb.service';
import { ConfigService } from '@nestjs/config';

describe('CompaniesController', () => {
  let app: INestApplication;
  const URL = 'https://www.google.com';
  const encodedURL = encodeURI(URL);
  const companyServiceMock = {
    getJobInformation: jest.fn(() => {
      return true;
    }),
  };
  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: companyServiceMock,
        },
        {
          provide: DynamoDBService,
          useValue: {
            getItem: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'AWS_REGION':
                  return 'us-east-1';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should execute findCompanyInformation when GET /companies/getinformation is called', async () => {
    const findCompanyInformationSpy = jest.spyOn(
      companyServiceMock,
      'getJobInformation',
    );

    const userId = 'testUserId';
    const encodedURL = encodeURIComponent(URL);

    const response = await request(app.getHttpServer()).get(
      `/companies/getinformation?url=${encodedURL}&userId=${userId}`, // Add userId to the query
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(findCompanyInformationSpy).toHaveBeenCalledWith(URL, userId);
  });

  it('should return 400 when  GET /companies/getinformation is called with invalid url', async () => {
    const respose = await request(app.getHttpServer()).get(
      '/companies/getinformation?url=invalidurl',
    );

    expect(respose.status).toBe(400);
    expect(respose.body).toEqual({
      message: 'Invalid URL',
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should handle error when GET /companies/getinformation is called and return 500', async () => {
    const findCompanyInformationSpy = jest.spyOn(
      companyServiceMock,
      'getJobInformation',
    );
    findCompanyInformationSpy.mockImplementation(() => {
      throw new Error('Error in getJobInformation');
    });

    const response = await request(app.getHttpServer()).get(
      '/companies/getinformation?url=' + encodedURL,
    );

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Internal Server Error',
      error: 'Error in getJobInformation',
    });
  });
});
