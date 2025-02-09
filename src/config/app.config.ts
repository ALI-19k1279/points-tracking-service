import { registerAs } from '@nestjs/config';
import { AppConfig } from './app-config.type';
import { IsEnum, IsInt, IsString, Max, Min } from 'class-validator';
import { validateConfig } from '@libs/utils';
import { Environment } from '@common/constants';

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  API_PREFIX: string;
}

const DEFAULT_CONFIG = {
  nodeEnv: 'development' as Environment,
  port: 3000,
  apiPrefix: '/api',
} as const;

const parsePort = (port: string | undefined): number => {
  if (!port) return DEFAULT_CONFIG.port;
  const parsedPort = parseInt(port, 10);
  return isNaN(parsedPort) ? DEFAULT_CONFIG.port : parsedPort;
};

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: (process.env.NODE_ENV as Environment) || DEFAULT_CONFIG.nodeEnv,
    port: parsePort(process.env.PORT ?? process.env.PORT),
    apiPrefix: process.env.API_PREFIX ?? DEFAULT_CONFIG.apiPrefix,
  };
});
