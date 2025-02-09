import { ENV_TYPES, ERROR_MESSAGES } from '@common/constants';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.getErrorMessage(exception);

    response.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private getErrorMessage(exception: any): string {
    const isEnvValidForCompleteError = [
      ENV_TYPES.LOCAL,
      ENV_TYPES.DEVELOPMENT,
    ].includes(process.env.NODE_ENV as string);
    if (
      !isEnvValidForCompleteError &&
      exception instanceof InternalServerErrorException
    ) {
      return ERROR_MESSAGES.SOMETHING_WENT_WRONG;
    } else {
      return exception.message;
    }
  }
}
