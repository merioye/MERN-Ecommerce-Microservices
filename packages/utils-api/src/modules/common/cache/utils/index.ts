import { ExecutionContext } from '@nestjs/common';

/**
 * Cache suffix based on user property
 * @param {string} [property='id'] - Property to use for cache key
 * @returns {MethodDecorator} Cache suffix function
 */
export const UserBasedCacheSuffix =
  (property = 'id') =>
  (ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return `user_${request.user[property]}`;
  };
