import { Module } from '@nestjs/common';

import { HEALTH_SERVICE } from './constants';
import { HealthController } from './health.controller';
import { HealthService } from './services';

/**
 * The module responsible for providing the health check endpoint.
 *
 * This module exposes a single endpoint that returns the health information
 * about the application.
 *
 * @module HealthModule
 */
@Module({
  controllers: [HealthController],
  providers: [{ provide: HEALTH_SERVICE, useClass: HealthService }],
})
export class HealthModule {}
