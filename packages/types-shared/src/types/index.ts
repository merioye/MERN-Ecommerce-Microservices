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
 * Type representing the response of an API ENDPOINT.
 *
 * @typedef ApiResponseParams<T>
 *
 * @property {T} result - The result of the API ENDPOINT, or null if the response is an error
 * @property {string} [message] - An optional descriptive information message about the operation
 * @property {number} [statusCode] - The optional HTTP status code of the response
 */
export type ApiResponseParams<T> = {
  result: T;
  message?: string;
  statusCode?: number;
};

/**
 * Type represents the structure of offset paginated query.
 *
 * @typedef OffsetPaginatedResult
 * @template T - The type of the result of the API call.
 *
 * @property {Array<T>} items - The array of items
 * @property {number} page - The current page number
 * @property {number} limit - The number of items per page
 * @property {number} totalPages - The total number of pages
 * @property {number} totalItems - The total number of items
 */
export type OffsetPaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
};

/**
 * Type represents the structure of API response for offset pagination query.
 *
 * @typedef OffsetPaginatedApiResponse
 * @template T - The type of the result of the API call.
 *
 * @property {number} statusCode - The HTTP status code of the error
 * @property {string} message - The error message
 * @property {boolean} success - Whether the request was successful
 * @property {OffsetPaginatedResult<T>} result - The result of the API call
 * @property {Object} errorInfo - The error information
 * @property {Array<ErrorFormat>} errors - The array of error objects
 */
export type OffsetPaginatedApiResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  result: OffsetPaginatedResult<T>;
  errorInfo: {};
  errors: Array<ErrorFormat>;
};

/**
 * Type represents the structure of cursor paginated query.
 *
 * @typedef CursorPaginatedResult
 * @template T - The type of the result of the API call.
 *
 * @property {Array<T>} items - The array of items
 * @property {string | null} nextCursor - The cursor to the next page
 * @property {boolean} hasNextPage - Whether there is a next page
 */
export type CursorPaginatedResult<T> = {
  items: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
};

/**
 * Type represents the structure of API response for cursor pagination query.
 *
 * @typedef CursorPaginatedApiResponse
 * @template T - The type of the result of the API call.
 *
 * @property {number} statusCode - The HTTP status code of the error
 * @property {string} message - The error message
 * @property {boolean} success - Whether the request was successful
 * @property {CursorPaginatedResult<T>} result - The result of the API call
 * @property {Object} errorInfo - The error information
 * @property {Array<ErrorFormat>} errors - The array of error objects
 */
export type CursorPaginatedApiResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  result: CursorPaginatedResult<T>;
  errorInfo: {};
  errors: Array<ErrorFormat>;
};

export * from './storage-service.types';
