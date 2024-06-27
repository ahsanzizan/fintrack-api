import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';

const CORS_URLS = ['http://localhost:3000'];
const PORT = 2000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({ origin: CORS_URLS });

  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalFilters(new HttpExceptionFilter(httpAdapterHost));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(PORT);
}
bootstrap();
