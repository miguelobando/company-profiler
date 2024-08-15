import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './modules/companies/companies.module';
import { ConfigModule } from '@nestjs/config';
import { SqsService } from './services/sqs.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CompaniesModule,
  ],
  controllers: [AppController],
  providers: [AppService, SqsService],
})
export class AppModule {}
