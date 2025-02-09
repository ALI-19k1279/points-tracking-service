import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/filters';
import helmet from 'helmet';
import { loggerInstance } from '@common/logger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@config/config.interface';

async function handleShutdown(signal: string, app: INestApplication) {
  loggerInstance.warn(
    `${signal} received. Starting graceful shutdown...`,
    bootstrap.name,
  );
  await app.close();
  process.exit(0);
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: loggerInstance,
    });

    const configService = app.get(ConfigService<AllConfigType>);

    app.enableCors();
    app.use(helmet());

    app.setGlobalPrefix(
      configService.getOrThrow('app.apiPrefix', { infer: true }),
      {
        exclude: ['/'],
      },
    );

    app.enableVersioning({
      type: VersioningType.URI,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    app.enableShutdownHooks();

    const options = new DocumentBuilder()
      .setTitle('API')
      .setDescription('API docs')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api-docs', app, document);

    const port = configService.getOrThrow('app.port', { infer: true });
    await app.listen(port);

    loggerInstance.log(
      `🚀 Application is running on: ${await app.getUrl()}`,
      bootstrap.name,
    );

    process.on('SIGTERM', () => handleShutdown('SIGTERM', app));

    process.on('SIGINT', () => handleShutdown('SIGINT', app));
  } catch (error) {
    loggerInstance.error('Failed to start application', bootstrap.name);
    if (error instanceof Error) {
      loggerInstance.error(error.message, error.stack);
    }
    process.exit(1);
  }
}

bootstrap();
