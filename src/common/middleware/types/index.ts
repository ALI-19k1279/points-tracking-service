export interface BrowserInfo {
  deviceType: string;
  browserName: string;
  browserVersion: string;
}

export interface RequestLogInfo {
  method: string;
  url: string;
  statusCode: number;
  ip: string;
  responseTime: number;
  browserInfo: BrowserInfo;
}
