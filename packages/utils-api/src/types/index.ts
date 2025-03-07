import { ErrorFormat } from '@ecohatch/types-shared';

import { Environment } from '@/enums';

/**
 * Type representing error metadata for logging purposes.
 *
 * @typedef LoggerErrorMetadata
 *
 * @property {string} id - A UUID identifying the error
 * @property {ErrorFormat} [errors] - An optional array of error objects, each containing the following fields:
 *  - message: The error message
 *  - field: The field name that caused the error
 *  - location: The location of the error
 *  - stack: The stack trace if the application is not in production mode, or null otherwise
 * @property {string | null} stack - The stack trace if the application is not in production mode, or null otherwise
 * @property {number} statusCode - The HTTP status code of the error
 * @property {string} path - The URL path of the request that caused the error
 * @property {string} method - The HTTP method of the request that caused the error
 */
export type LoggerErrorMetadata = {
  id: string;
  errors?: ErrorFormat[];
  stack: string | null;
  statusCode: number;
  path: string;
  method: string;
};

/**
 * Type representing the LoggerModuleOptions.
 *
 * @typedef LoggerModuleOptions
 *
 * @property {Environment} environment - The environment in which the application is running.
 * @property {string} logsDirPath - The path to the directory where logs will be stored.
 * @property {boolean} debugMode - Whether the application is running in debug mode.
 * @property {string} appName - The name of the application
 */
export type LoggerModuleOptions = {
  environment: Environment;
  logsDirPath: string;
  debugMode: boolean;
  appName: string;
};

/**
 * Type representing the TranslatorModuleOptions.
 *
 * @typedef TranslatorModuleOptions
 *
 * @property {string} fallbackLanguage - The default language to use when translations are missing.
 * @property {string} translationsDirPath - The path to the directory containing the translation files.
 * @property {string} translationsFileName - The name of the file that contains the translations.
 * @property {string} langExtractionKey - The key used to extract the language from the incoming request.
 */
export type TranslatorModuleOptions = {
  fallbackLanguage: string;
  translationsDirPath: string;
  translationsFileName: string;
  langExtractionKey: string;
};

/**
 * Type representing the CacheModuleOptions.
 *
 * @typedef CacheModuleOptions
 *
 * @property {string} url - The URL of the cache server.
 * @property {number} [ttl] - The time-to-live (TTL) of the cache entry in seconds. If not specified, the cache entry will be stored indefinitely.
 */
export type CacheModuleOptions = {
  url: string;
  ttl?: number;
};
