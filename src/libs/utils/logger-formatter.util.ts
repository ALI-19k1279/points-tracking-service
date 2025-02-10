import { RequestLogInfo } from '@common/middleware/types';

export class LoggerFormatter {
  private static readonly COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
  };

  static formatRequestLog(logInfo: RequestLogInfo): string {
    const { method, url, statusCode, ip, responseTime, browserInfo } = logInfo;
    const { deviceType, browserName, browserVersion } = browserInfo;

    return [
      '💥',
      `${this.COLORS.green}${method}${this.COLORS.reset}`,
      `${this.COLORS.blue}${url}${this.COLORS.reset}`,
      `${this.COLORS.yellow}${statusCode}${this.COLORS.reset}`,
      '-',
      `${deviceType}: ${browserName} ${browserVersion}`,
      ip,
      '-',
      `${this.COLORS.red}${responseTime}ms${this.COLORS.reset}`,
    ].join(' ');
  }
}
