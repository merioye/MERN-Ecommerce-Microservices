import { ExecutionContext } from "@nestjs/common";

/**
 * Invalidation options for @InvalidateCache decorator
 */
export type CacheKeySuffixType = string | ((context: ExecutionContext) => string);
export type InvalidateCacheOptions =
  | { entities: string[]; keySuffix?: CacheKeySuffixType }
  | { entities?: string[]; keySuffix: CacheKeySuffixType };