import { join, resolve } from 'path';
import { ConfigModuleOptions } from '@nestjs/config';
import {
  Environment,
  LoggerModuleOptions,
  TranslationKeySeparator,
  TranslatorModuleOptions,
} from '@ecohatch/utils-api';
import Joi from 'joi';

import { Config } from '@/enums';
import { APP_NAME } from '@/constants';

const { DEV, TEST, PROD } = Environment;

/**
 * ConfigModule options
 */
const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: join(__dirname, `../../.env.${process.env[Config.NODE_ENV]}`),
  validationSchema: Joi.object({
    PORT: Joi.number().default(5000),
    NODE_ENV: Joi.string().valid(DEV, TEST, PROD).required(),
    API_PREFIX: Joi.string().required(),
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
  translationKeySeparator: TranslationKeySeparator,
};

export { configOptions, loggerModuleOptions, translatorModuleOptions };