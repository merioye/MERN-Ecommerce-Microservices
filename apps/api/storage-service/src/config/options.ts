import { join, resolve } from 'path';
import { ConfigModuleOptions } from '@nestjs/config';
import {
  CacheModuleOptions,
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
    PORT: Joi.number().default(5002),
    NODE_ENV: Joi.string().valid(DEV, TEST, PROD).required(),
    API_DEFAULT_VERSION: Joi.string().required(),
    DEBUG_MODE: Joi.boolean().default(false),
    GRACEFUL_SHUTDOWN_TIMEOUT: Joi.number().default(30000),
    LOCALIZATION_KEY: Joi.string().required(),
    LOCALIZATION_FALLBACK_LANGUAGE: Joi.string().required(),
    SWAGGER_USERNAME: Joi.string().required(),
    SWAGGER_PASSWORD: Joi.string().required(),
    CACHE_URL: Joi.string().uri().required(),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string().required(),
    AWS_REGION: Joi.string().required(),
    AWS_S3_ENDPOINT: Joi.string().uri().required(),
    AWS_S3_BUCKET_NAME: Joi.string().required(),
    UPLOAD_FILE_URL_EXPIRATION: Joi.number().required(),
    DATABASE_URL: Joi.string().uri().required(),
    DATABASE_MAX_RETRIES: Joi.number().required(),
    DATABASE_RETRY_DELAY: Joi.number().required(),
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

export {
  configOptions,
  loggerModuleOptions,
  translatorModuleOptions,
  cacheModuleOptions,
};
