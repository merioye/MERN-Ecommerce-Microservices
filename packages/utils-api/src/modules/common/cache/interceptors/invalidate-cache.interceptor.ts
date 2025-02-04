import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';

import { CACHE_SERVICE, INVALIDATE_CACHE_DECORATOR_KEY } from '../constants';
import { ICacheService } from '../interfaces';
import { InvalidateCacheOptions } from '../types';

/**
 * Cache Invalidation Interceptor
 * @class InvalidateCacheInterceptor
 * @implements {NestInterceptor}
 */
@Injectable()
export class InvalidateCacheInterceptor implements NestInterceptor {
  public constructor(
    @Inject(CACHE_SERVICE) private readonly _cacheService: ICacheService,
    private readonly _reflector: Reflector
  ) {}

  /**
   * Handles cache invalidation after method execution
   * @param {ExecutionContext} context - Execution context
   * @param {CallHandler} next - Next handler in pipeline
   * @returns {Observable<any>}
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const options = this.getInvalidationOptions(context);

    return next.handle().pipe(
      tap(async () => {
        if (options.entities) {
          await this.invalidateEntityCaches(options.entities || []);
        }
        if (options.keySuffix) {
          const keySuffix =
            typeof options.keySuffix === 'string'
              ? options.keySuffix
              : options.keySuffix(context);
          await this._cacheService.deleteByPattern(`cache:*:${keySuffix}`);
        }
      })
    );
  }

  /**
   * Retrieves cache invalidation options with hierarchy support
   * (Method-level > Class-level > Default)
   * @private
   * @param {ExecutionContext} context - Execution context
   * @returns {Object} Merged invalidation options
   */
  private getInvalidationOptions(context: ExecutionContext): InvalidateCacheOptions {
    const handler = context.getHandler();
    const controller = context.getClass();

    // Get options from different levels
    const methodOptions = this._reflector.get(
      INVALIDATE_CACHE_DECORATOR_KEY,
      handler
    );
    const classOptions = this._reflector.get(
      INVALIDATE_CACHE_DECORATOR_KEY,
      controller
    );

    // Merge options with priority: method > class > default
    return {
      entities: [
        ...(classOptions?.entities || []),
        ...(methodOptions?.entities || []),
      ],
      keySuffix: methodOptions?.keySuffix || classOptions?.keySuffix,
    };
  }

  /**
   * Invalidates cache for specific entities
   * @private
   * @param {string[]} entities - List of entities to invalidate
   * @returns {Promise<void>}
   */
  private async invalidateEntityCaches(entities: string[]) {
    const patterns = entities.map((entity) => `cache:*:${entity}:*`);
    await Promise.all(
      patterns.map((pattern) => this._cacheService.deleteByPattern(pattern))
    );
  }
}
