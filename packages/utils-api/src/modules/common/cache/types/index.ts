import { ExecutionContext } from '@nestjs/common';

/**
 * Invalidation options for @InvalidateCache decorator
 */
export type CacheKeySuffixType =
  | string
  | ((context: ExecutionContext) => string);
export type InvalidateCacheOptions =
  | { entities: string[]; keySuffix?: CacheKeySuffixType }
  | { entities?: string[]; keySuffix: CacheKeySuffixType };

/**
 * Type representing the CacheModuleOptions.
 *
 * @typedef CacheModuleOptions
 *
 * @property {string} url - The URL of the cache server.
 * @property {number} [ttl] - The time-to-live (TTL) of the cache entry in seconds. If not specified, the cache entry will be stored indefinitely.
 */
export type CacheModuleOptions = {
  url: string;
  ttl?: number;
};
