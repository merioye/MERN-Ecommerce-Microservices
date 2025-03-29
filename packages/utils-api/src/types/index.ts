import { ErrorFormat } from '@ecohatch/types-shared';

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
