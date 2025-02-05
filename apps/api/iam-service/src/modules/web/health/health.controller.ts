import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ILogger, LOGGER } from '@ecohatch/utils-api';

import { ENDPOINT } from '@/constants';

import { HEALTH_SERVICE } from './constants';
import { IHealthService } from './interfaces';
import { Health } from './types';

/**
 * The controller responsible for handling the server health check ENDPOINT.
 *
 * @class HealthController
 */
@Controller()
@ApiTags('Health')
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
    @Inject(LOGGER) private readonly _logger: ILogger,
    @Inject(HEALTH_SERVICE) private readonly _healthService: IHealthService
  ) {}

  /**
   * The ENDPOINT which returns the server health information.
   *
   * @returns The health information.
   */
  @Get(ENDPOINT.Health.Get.HealthCheck)
  @ApiOkResponse({ description: 'Server health information.' })
  public async checkHealth(): Promise<Health> {
    this._logger.info('Request for checking server health');
    return await this._healthService.health();
  }
}
