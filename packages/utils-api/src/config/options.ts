import { ValidationPipeOptions } from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';
import { ErrorFormat } from '@ecohatch/types-shared';

/**
 * ValidationPipe options
 */
const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  transform: true,
  validateCustomDecorators: true,
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
