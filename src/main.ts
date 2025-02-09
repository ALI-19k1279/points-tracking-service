import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/filters';
import helmet from 'helmet';
import { loggerInstance } from '@common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: loggerInstance,
  });

  app.enableCors();
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
  loggerInstance.log(
    `Application is running on: ${await app.getUrl()}`,
    bootstrap.name,
  );
}
bootstrap();
