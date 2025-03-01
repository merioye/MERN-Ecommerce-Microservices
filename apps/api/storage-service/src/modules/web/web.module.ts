import { Module } from '@nestjs/common';

import { HealthModule } from './health';
import { StorageModule } from './storage';

/**
 * The WebAppModule is a module that contains all the api related features and
 * services.
 *
 * @module WebAppModule
 */
@Module({
  imports: [HealthModule, StorageModule],
  exports: [WebAppModule],
})
export class WebAppModule {}
