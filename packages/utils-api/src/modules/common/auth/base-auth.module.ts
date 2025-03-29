import { DynamicModule, Module } from '@nestjs/common';

import { AUTH_MODULE_OPTIONS } from './constants';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { BaseAuthModuleOptions } from './types';

/**
 * Base authentication module containing reusable authentication utilities
 *
 * @module BaseAuthModule
 */
@Module({})
export class BaseAuthModule {
  /**
   * Registers the base authentication module
   *
   * @param {BaseAuthModuleOptions} options - Configuration options for the base authentication module
   * @returns {DynamicModule} - The base authentication module
   */
  public static forRoot(options: BaseAuthModuleOptions): DynamicModule {
    return {
      global: true,
      module: BaseAuthModule,
      providers: [
        {
          provide: AUTH_MODULE_OPTIONS,
          useValue: options,
        },
        AccessTokenStrategy,
        RefreshTokenStrategy,
      ],
      exports: [AccessTokenStrategy, RefreshTokenStrategy],
    };
  }
}
