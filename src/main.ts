import { LogLevel, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { TransformInterceptor } from './utils/interceptors/transform.interceptor';

const CORS_URLS = ['http://localhost:3000'];
const PORT = 2000;

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const logLevels: LogLevel[] = isProduction
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'verbose', 'debug'];

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  app.use(cookieParser());
  app.use(helmet());

  app.enableCors({ origin: CORS_URLS });

  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useGlobalInterceptors(new TransformInterceptor());

  const documentConfig = new DocumentBuilder()
    .setTitle('FinTrack API')
    .setDescription(
      'FinTrack API is a robust and intuitive expense tracker API designed to empower users to take control of their personal finances. With FinTrack, users can effortlessly track their expenses and incomes, categorize transactions, and generate insightful reports. The API aims to provide a comprehensive solution for personal finance management, making it easy for users to monitor their spending habits, set budgets, and achieve their financial goals.',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .addTag('expenses')
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(PORT);
}

bootstrap();
