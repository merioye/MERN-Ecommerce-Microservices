import { SetMetadata } from '@nestjs/common';

import { CACHE_KEY_SUFFIX_DECORATOR_KEY } from '../constants';
import { CacheKeySuffixType } from '../types';

/**
 * Decorator to define cache key suffix generation
 * @param {CacheKeySuffixType} keySuffix - Key suffix or function to generate suffix
 * @returns {MethodDecorator}
 */
export const CacheKeySuffix = (
  keySuffix: CacheKeySuffixType
) => SetMetadata(CACHE_KEY_SUFFIX_DECORATOR_KEY, keySuffix);
