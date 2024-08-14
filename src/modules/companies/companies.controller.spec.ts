import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

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

  it('should execute findCompanyInformation when POST /companies/getinformation is called', async () => {
    const findCompanyInformationSpy = jest.spyOn(
      companyServiceMock,
      'getJobInformation',
    );

    const respose = await request(app.getHttpServer()).get(
      '/companies/getinformation?url=' + encodedURL,
    );

    expect(respose.status).toBe(200);
    expect(respose.body).toEqual({ success: true });
    expect(findCompanyInformationSpy).toHaveBeenCalledWith(URL);
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
});
