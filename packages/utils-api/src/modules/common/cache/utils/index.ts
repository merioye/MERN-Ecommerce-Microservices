import { ExecutionContext } from '@nestjs/common';

import { AuthRequestUser } from '../../auth';

/**
 * Cache suffix based on user property
 * @param {string} [property='userId'] - Property to use for cache key
 * @returns {MethodDecorator} Cache suffix function
 */
export const UserBasedCacheSuffix =
  (property: keyof AuthRequestUser = 'userId') =>
  (ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthRequestUser }>();
    return `user_${request.user[property]?.toString()}`;
  };
