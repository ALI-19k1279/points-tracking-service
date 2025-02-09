import { ENV_TYPES } from '@common/constants';
import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const isProd = process.env.NODE_ENV === ENV_TYPES.PRODUCTION;

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const commonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.ms(),
  winston.format.errors({ stack: true }),
);

const devFormat = winston.format.combine(
  commonFormat,
  winston.format.splat(),
  utilities.format.nestLike('PointsTrackingService', {
    colors: true,
    prettyPrint: true,
  }),
);

const prodFormat = winston.format.combine(commonFormat, winston.format.json());

const devTransports = [
  new winston.transports.Console({
    level: 'debug',
    format: devFormat,
  }),
];

//can be extended with more transports like file, http, etc.
const prodTransports = [
  new winston.transports.Console({
    level: 'info',
    format: prodFormat,
  }),
];

const winstonConfig = {
  levels: logLevels,
  transports: isProd ? prodTransports : devTransports,
};

export const loggerInstance = WinstonModule.createLogger(winstonConfig);
