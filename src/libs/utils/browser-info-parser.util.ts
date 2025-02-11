import { BrowserInfo } from '@common/middleware/types';

export class BrowserInfoParser {
  private static readonly BROWSER_REGEX =
    /(Opera|Chrome|Safari|Firefox|MSIE|Trident).*?(\d+\.\d+)/;

  static parse(userAgent: string): BrowserInfo {
    const regexResult = this.BROWSER_REGEX.exec(userAgent);

    return {
      deviceType: userAgent.includes('Mobile') ? 'Mobile' : 'Browser',
      browserName: regexResult?.[1] ?? 'Unknown',
      browserVersion: regexResult?.[2] ?? 'Unknown',
    };
  }
}
