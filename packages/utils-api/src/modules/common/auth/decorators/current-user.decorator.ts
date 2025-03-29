import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthRequestUser } from '../types';

/**
 * Decorator to inject the current user into a controller or service
 *
 * @param {keyof AuthRequestUser} [key] - Optional key to access a specific property of the user object
 * @returns {AuthRequestUser | AuthRequestUser[keyof AuthRequestUser]} - The current user or a specific property of the user object
 */
export const CurrentUser = createParamDecorator(
  (key: keyof AuthRequestUser, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthRequestUser }>();
    return key ? request.user[key] : request.user;
  }
);
