import { Controller, Get, Inject } from '@nestjs/common';
import { ILogger, LoggerToken } from '@ecohatch/utils-api';

import { EndPoint } from '@/constants';

import { HealthServiceToken } from './constants';
import { IHealthService } from './interfaces';
import { Health } from './types';

/**
 * The controller responsible for handling the server health check endpoint.
 *
 * @class HealthController
 */
@Controller()
export class HealthController {
  /**
   * Creates a new HealthController instance.
   *
   * @constructor
   * @param logger - The logger to be used to log messages.
   * @param healthService - The health service which is responsible for
   *   providing the health information.
   */
  public constructor(
    @Inject(LoggerToken) private readonly _logger: ILogger,
    @Inject(HealthServiceToken) private readonly _healthService: IHealthService
  ) {}

  /**
   * The endpoint which returns the server health information.
   *
   * @returns The health information.
   */
  @Get(EndPoint.Health.Get.HealthCheck)
  public checkHealth(): Promise<Health> {
    this._logger.info('Request for checking server health');
    return this._healthService.health();
  }
}