import { DynamicModule } from '@nestjs/common';

import { CacheModuleOptions } from '@/types';

import { CACHE_CONFIG, CACHE_SERVICE } from './constants';
import { RedisCacheService } from './services';
import { HashModule } from '../hash';

/**
 * Global Cache Module for NestJS providing centralized caching functionality
 * @module CacheModule
 */
export class CacheModule {
  /**
   * Registers the cache module with the provided options
   * @param {CacheModuleOptions} options - Options to configure the cache
   * @returns {DynamicModule} Configured NestJS dynamic module
   */
  public static register(options: CacheModuleOptions): DynamicModule {
    return {
      global: true,
      module: CacheModule,
      imports: [HashModule],
      providers: [
        {
          provide: CACHE_CONFIG,
          useValue: options,
        },
        {
          provide: CACHE_SERVICE,
          useClass: RedisCacheService,
        },
      ],
      exports: [CACHE_SERVICE, CACHE_CONFIG],
    };
  }
}
