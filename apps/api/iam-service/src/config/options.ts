import { join, resolve } from 'path';
import { ConfigModuleOptions } from '@nestjs/config';
import {
  BaseAuthModuleOptions,
  CacheModuleOptions,
  CronJobModuleOptions,
  Environment,
  LoggerModuleOptions,
  TranslatorModuleOptions,
} from '@ecohatch/utils-api';
import * as dotenv from 'dotenv';
import Joi from 'joi';

import { Config } from '@/enums';
import { APP_NAME } from '@/constants';

dotenv.config({
  path: join(__dirname, `../../.env.${process.env[Config.NODE_ENV]}`),
});

const { DEV, TEST, PROD } = Environment;

/**
 * ConfigModule options
 */
const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: join(__dirname, `../../.env.${process.env[Config.NODE_ENV]}`),
  validationSchema: Joi.object({
    PORT: Joi.number().default(5001),
    NODE_ENV: Joi.string().valid(DEV, TEST, PROD).required(),
    API_DEFAULT_VERSION: Joi.string().required(),
    DEBUG_MODE: Joi.boolean().default(false),
    GRACEFUL_SHUTDOWN_TIMEOUT: Joi.number().default(30000),
    LOCALIZATION_KEY: Joi.string().required(),
    LOCALIZATION_FALLBACK_LANGUAGE: Joi.string().required(),
    DATABASE_URL: Joi.string().required(),
    DATABASE_MAX_RETRIES: Joi.number().default(5),
    DATABASE_RETRY_DELAY: Joi.number().default(1000),
    DATABASE_MAX_RETRY_DELAY: Joi.number().default(60000),
    PRISMA_SCHEMA_PATH: Joi.string().required(),
    SWAGGER_USERNAME: Joi.string().required(),
    SWAGGER_PASSWORD: Joi.string().required(),
    CACHE_URL: Joi.string().required(),
    ADMIN_USER_EMAIL: Joi.string().required(),
    ADMIN_USER_PASSWORD: Joi.string().required(),
    SYSTEM_USER_EMAIL: Joi.string().required(),
    SYSTEM_USER_PASSWORD: Joi.string().required(),
    MAX_LOGIN_ATTEMPTS_ALLOWED: Joi.number().required(),
    LOGIN_ATTEMPT_LOCKOUT_DURATION_MILLS: Joi.number().required(),
    JWT_ACCESS_PRIVATE_KEY: Joi.string().required(),
    JWT_ACCESS_PUBLIC_KEY: Joi.string().required(),
    JWT_REFRESH_PRIVATE_KEY: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_TIME: Joi.number().required(),
    JWT_REFRESH_EXPIRATION_TIME: Joi.number().required(),
    JWT_ISSUER: Joi.string().required(),
    JWT_AUDIENCE: Joi.string().required(),
    JWKS_URL: Joi.string().required(),
  }),
  validationOptions: {
    abortEarly: true,
  },
};

/**
 * LoggerModule options
 */
const loggerModuleOptions: LoggerModuleOptions = {
  environment: process.env[Config.NODE_ENV] as Environment,
  logsDirPath: resolve(process.cwd(), 'logs'),
  debugMode: process.env[Config.DEBUG_MODE] == 'true',
  appName: APP_NAME,
};

/**
 * TranslatorModule options
 */
const translatorModuleOptions: TranslatorModuleOptions = {
  fallbackLanguage: process.env[Config.LOCALIZATION_FALLBACK_LANGUAGE]!,
  translationsDirPath: resolve(
    process.cwd(),
    `${
      process.env[Config.NODE_ENV] === Environment.PROD ? 'dist' : 'src'
    }/translations`
  ),
  translationsFileName: 'translations.json',
  langExtractionKey: process.env[Config.LOCALIZATION_KEY]!,
};

/**
 * CacheModule options
 */
const cacheModuleOptions: CacheModuleOptions = {
  url: process.env[Config.CACHE_URL]!,
};

/**
 * CronJobModule options
 */
const cronJobModuleOptions: CronJobModuleOptions = {
  jobs: [],
};

const baseAuthModuleOptions: BaseAuthModuleOptions = {
  authDbUrl: process.env[Config.DATABASE_URL]!,
  jwksUrl: process.env[Config.JWKS_URL]!,
  jwtAudience: process.env[Config.JWT_AUDIENCE]!,
  jwtIssuer: process.env[Config.JWT_ISSUER]!,
  refreshTokenSecret: process.env[Config.JWT_REFRESH_PRIVATE_KEY]!,
  jwksRequestsPerMinute: 10,
};

export {
  configOptions,
  loggerModuleOptions,
  translatorModuleOptions,
  cacheModuleOptions,
  cronJobModuleOptions,
  baseAuthModuleOptions,
};
