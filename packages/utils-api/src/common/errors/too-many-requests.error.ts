import { HttpStatus } from '@nestjs/common';

import { CustomError } from './custom.error';

/**
 * TooManyRequestsError is a custom error class that represents a Too Many Requests Exception.
 * It extends the CustomError class. This class is used to create instances
 * of TooManyRequestsError with a specified error message. If no message is provided,
 * the default message 'Too many requests' will be used.
 *
 * @class TooManyRequestsError
 * @extends CustomError
 *
 * @example
 * const error = new TooManyRequestsError('Too many requests');
 */
export class TooManyRequestsError extends CustomError {
  /**
   * Creates a new TooManyRequestsError instance with the specified error message.
   * If no message is provided, the default message 'Too many requests' is used.
   *
   * @constructor
   * @param [message='Too many requests'] - The error message.
   */
  public constructor(message = 'common.error.Too_many_requests') {
    super(message, 'TooManyRequestsException', HttpStatus.TOO_MANY_REQUESTS);
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}
