import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SqsModule } from './modules/sqs/sqs.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SqsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
