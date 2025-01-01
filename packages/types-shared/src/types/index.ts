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
 * Type represents the structure of API response.
 *
 * @typedef ApiResponse
 * @template T - The type of the result of the API call.
 *
 * @property {number} statusCode - The HTTP status code of the error
 * @property {string} message - The error message
 * @property {boolean} success - Whether the request was successful
 * @property {T} result - The result of the API call
 * @property {Object} errorInfo - The error information
 * @property {Array<ErrorFormat>} errors - The array of error objects
 */
export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  result: T;
  errorInfo: {};
  errors: Array<ErrorFormat>;
};
