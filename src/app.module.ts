import { Logger, Module } from '@nestjs/common';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from '@config/app.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PointsModule } from './modules/points/points.module';
import { RouteLoggerMiddleware } from '@common/middleware';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '@common/logger';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    UserModule,
    PointsModule,
  ],
  controllers: [],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer) {
    consumer.apply(RouteLoggerMiddleware).forRoutes('*');
  }
}
