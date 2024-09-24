import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { envConfig } from './common/config/env.config';
import * as cookieParser from 'cookie-parser';
import * as hpp from 'hpp';
import helmet from 'helmet';
import {
  GlobalExceptionFilter,
  ValidatorErrorHandler,
} from './common/exceptions/global.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // set port
  const PORT = envConfig.PORT || 3000;

  // allow cookie
  app.use(cookieParser());

  // Prevent parameter pollution
  app.use(hpp());

  // Set security HTTP headers
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: [`${envConfig.LOCAL_URL}`, `${envConfig.CLIENT_URL}`],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
  });

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(new ValidationPipe(ValidatorErrorHandler));

  // set global prefix
  app.setGlobalPrefix('api/v2');

  await app.listen(PORT);
}
bootstrap();
