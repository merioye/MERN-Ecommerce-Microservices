import { DynamicModule } from '@nestjs/common';

import { CacheModule } from './cache';
import { HashModule } from './hash';
import { LoggerModule } from './logger';
import { TranslatorModule } from './translator';
import { CommonAppModuleOptions } from './types';

/**
 * The CommonAppModule is a module that contains all the common features and services
 * that are being used by the application.
 *
 * @module CommonAppModule
 */
export class CommonAppModule {
  /**
   * Configures the CommonAppModule for the application.
   *
   * @static
   * @param options - The options for the CommonAppModule.
   * @returns The DynamicModule for the CommonAppModule.
   */
  public static forRoot({
    logger,
    translator,
    cache,
  }: CommonAppModuleOptions): DynamicModule {
    return {
      module: CommonAppModule,
      imports: [
        HashModule,
        LoggerModule.forRoot(logger),
        TranslatorModule.forRoot(translator),
        CacheModule.register(cache),
      ],
    };
  }
}
