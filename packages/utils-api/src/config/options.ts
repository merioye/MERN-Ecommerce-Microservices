import { ValidationPipeOptions } from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';

import { ErrorFormat } from '@/types';

/**
 * ValidationPipe options
 */
const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  exceptionFactory: (errors) => {
    const formatedErrors = errors?.map((error): ErrorFormat => {
      const message = Object.values(error.constraints || {})[0];
      return {
        message: message || 'common.error.Invalid_value',
        field: error.property,
        location: 'body',
        stack: null,
      };
    });
    throw new RequestValidationError(formatedErrors);
  },
};

export { validationPipeOptions };