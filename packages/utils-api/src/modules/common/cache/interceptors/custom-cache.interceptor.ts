import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, tap } from 'rxjs';

import { CacheModuleOptions } from '@/types';

import { ILogger, LOGGER } from '../../logger';
import {
  CACHE_CONFIG,
  CACHE_KEY_SUFFIX_DECORATOR_KEY,
  CACHE_SERVICE,
  CACHE_TTL_DECORATOR_KEY,
  EXCLUDE_FROM_CACHE_DECORATOR_KEY,
} from '../constants';
import { ICacheService } from '../interfaces';
import { CacheKeySuffixType } from '../types';

/**
 * Cache Interceptor for automatic request caching
 * @class CustomCacheInterceptor
 * @implements {NestInterceptor}
 */
@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  private readonly _cacheableMethods = ['GET'];

  public constructor(
    @Inject(CACHE_CONFIG) private readonly _cacheConfig: CacheModuleOptions,
    @Inject(CACHE_SERVICE) private readonly _cacheService: ICacheService,
    @Inject(LOGGER) private readonly _logger: ILogger,
    private readonly _reflector: Reflector
  ) {}

  /**
   * Intercepts requests to implement cache-aside pattern
   * @param {ExecutionContext} context - Request context
   * @param {CallHandler} next - Next handler in pipeline
   * @returns {Observable<any>} Observable of response data
   */
  public async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    if (!this.isCacheableRequest(context)) {
      return next.handle();
    }

    const suffix = this.getCacheSuffix(context);
    const key = await this._cacheService.generateCacheKey(context, suffix);
    const cachedData = await this._cacheService.get(key);

    if (cachedData) {
      this._logger.debug(`Cache hit for key: ${key}`);
      return of(cachedData);
    } else {
      this._logger.debug(`Cache miss for key: ${key}`);
    }

    const ttl = this.getTTL(context);
    return next.handle().pipe(
      tap(async (data) => {
        await this._cacheService.set(key, data, ttl);
      })
    );
  }

  /**
   * Determines if the request should be cached
   * @param {ExecutionContext} context - Request context
   * @private
   * @returns {boolean} True if cacheable, false otherwise
   */
  private isCacheableRequest(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const handlerExcludeFromCache = this._reflector.get<boolean>(
      EXCLUDE_FROM_CACHE_DECORATOR_KEY,
      context.getHandler()
    );
    const classExcludeFromCache = this._reflector.get<boolean>(
      EXCLUDE_FROM_CACHE_DECORATOR_KEY,
      context.getClass()
    );
    if (handlerExcludeFromCache || classExcludeFromCache) return false;

    return (
      this._cacheableMethods.includes(request.method) &&
      !request.headers['x-no-cache']
    ); // Header-based exclusion
  }

  /**
   * Retrieves cache suffix from metadata
   * @param {ExecutionContext} context - Request context
   * @private
   * @returns {string | undefined} Cache suffix if present else undefined
   */
  private getCacheSuffix(context: ExecutionContext): string | undefined {
    try {
      const handlerKeySuffix = this._reflector.get<
      CacheKeySuffixType>(CACHE_KEY_SUFFIX_DECORATOR_KEY, context.getHandler());

      const classKeySuffix = this._reflector.get<
        CacheKeySuffixType
      >(CACHE_KEY_SUFFIX_DECORATOR_KEY, context.getClass());

      const keySuffix = handlerKeySuffix || classKeySuffix;
      return typeof keySuffix === 'string' ? keySuffix : keySuffix?.(context);
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Get TTL from method metadata first, then class metadata else return default provided ttl
   * @param context - Request context
   * @returns TTL (Time-to-live) in seconds
   */
  private getTTL(context: ExecutionContext): number | undefined {
    return (
      this._reflector.get<number>(
        CACHE_TTL_DECORATOR_KEY,
        context.getHandler()
      ) ||
      this._reflector.get<number>(
        CACHE_TTL_DECORATOR_KEY,
        context.getClass()
      ) ||
      this._cacheConfig.ttl
    );
  }
}
