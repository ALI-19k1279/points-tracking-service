import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestLogInfo } from './types';
import { BrowserInfoParser, LoggerFormatter } from '@libs/utils';

@Injectable()
export class RouteLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RouteLoggerMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const start = Date.now();

    response.once('finish', () => {
      const logInfo = this.buildRequestLogInfo(request, response, start);
      const formattedLog = LoggerFormatter.formatRequestLog(logInfo);
      this.logger.log(formattedLog);
    });

    next();
  }

  private buildRequestLogInfo(
    request: Request,
    response: Response,
    startTime: number,
  ): RequestLogInfo {
    const { method, originalUrl } = request;
    const { statusCode } = response;
    const responseTime = Date.now() - startTime;
    const browserInfo = BrowserInfoParser.parse(
      request.headers['user-agent'] || '',
    );

    const ip =
      request.ip ||
      (request.headers['x-forwarded-for'] as string) ||
      request.socket.remoteAddress ||
      'unknown';

    return {
      method,
      url: originalUrl,
      statusCode,
      ip,
      responseTime,
      browserInfo,
    };
  }
}
