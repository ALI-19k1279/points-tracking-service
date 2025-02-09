import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/filters';
import helmet from 'helmet';
import { loggerInstance } from '@common/logger';

async function bootstrap() {
  try {
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

    app.enableShutdownHooks();

    const port = process.env.PORT ?? 3000;
    await app.listen(port);

    loggerInstance.log(
      `🚀 Application is running on: ${await app.getUrl()}`,
      bootstrap.name,
    );

    process.on('SIGTERM', async () => {
      loggerInstance.warn(
        'SIGTERM received. Starting graceful shutdown...',
        bootstrap.name,
      );
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      loggerInstance.warn(
        'SIGINT received. Starting graceful shutdown...',
        bootstrap.name,
      );
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    loggerInstance.error('Failed to start application', bootstrap.name);
    if (error instanceof Error) {
      loggerInstance.error(error.message, error.stack);
    }
    process.exit(1);
  }
}

bootstrap();
