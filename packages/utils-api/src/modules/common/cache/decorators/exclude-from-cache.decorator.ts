import { SetMetadata } from '@nestjs/common';

import { EXCLUDE_FROM_CACHE_DECORATOR_KEY } from '../constants';

/**
 * Decorator to exclude a method from cache (Opt-out of caching)
 * Skip the cache for this method
 * @returns {MethodDecorator}
 */
export const ExcludeFromCache = () =>
  SetMetadata(EXCLUDE_FROM_CACHE_DECORATOR_KEY, true);
