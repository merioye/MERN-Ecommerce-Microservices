import { Module } from '@nestjs/common';

import { AdminModule } from './admin';
import { HealthModule } from './health';

/**
 * The WebAppModule is a module that contains all the api related features and
 * services.
 *
 * @module WebAppModule
 */
@Module({
  imports: [HealthModule, AdminModule],
  exports: [WebAppModule],
})
export class WebAppModule {}
