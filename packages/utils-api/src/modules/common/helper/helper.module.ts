import { Global, Module } from '@nestjs/common';

import { HTTP_HELPER_SERVICE } from './constants';
import { HttpHelperService } from './services';

/**
 * Global Helper Module for NestJS providing centralized helper functionality
 * @module HelperModule
 */
@Module({
  providers: [
    {
      provide: HTTP_HELPER_SERVICE,
      useClass: HttpHelperService,
    },
  ],
  exports: [HTTP_HELPER_SERVICE],
})
@Global()
export class HelperModule {}
