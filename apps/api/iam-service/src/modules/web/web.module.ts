import { Module } from '@nestjs/common';

import { AdminModule } from './admin';
import { AuthModule } from './auth';
import { HealthModule } from './health';
import { PermissionModule } from './permission';

/**
 * The WebAppModule is a module that contains all the api related features and
 * services.
 *
 * @module WebAppModule
 */
@Module({
  imports: [HealthModule, AdminModule, AuthModule, PermissionModule],
  exports: [WebAppModule],
})
export class WebAppModule {}
