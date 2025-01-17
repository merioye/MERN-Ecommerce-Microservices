import { Environment } from '@/enums';

/**
 * Type representing an error object.
 *
 * @typedef ErrorFormat
 *
 * @property {string} message - The error message
 * @property {string} field - The field name that caused the error
 * @property {string} location - The location of the error
 * @property {string | null} stack - The stack trace if the application is not in production mode, or null otherwise
 */
export type ErrorFormat = {
  message: string;
  field: string;
  location: string;
  stack: string | null;
};

/**
 * Type represents the structure of the exception response body.
 *
 * @typedef ExceptionResponseBody
 *
 * @property {number} statusCode - The HTTP status code of the error
 * @property {string} message - The error message
 * @property {boolean} success - Whether the request was successful
 * @property {ErrorFormat} errorInfo - The error information
 * @property {Array<ErrorFormat>} errors - The array of error objects
 */
export type ExceptionResponseBody = {
  statusCode: number;
  message: string;
  success: false;
  result: null;
  errorInfo: {
    ref: string;
    type: string;
    path: string;
    method: string;
  };
  errors: Array<ErrorFormat>;
};

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
 * @property {string} translationKeySeparator - The separator used to separate the translation key from the arguments.
 */
export type TranslatorModuleOptions = {
  fallbackLanguage: string;
  translationsDirPath: string;
  translationsFileName: string;
  langExtractionKey: string;
  translationKeySeparator: string;
};

export * from './api-response.types';
