import { Inject, Injectable } from '@nestjs/common';
import { ITranslatorService, TRANSLATOR_SERVICE } from '@ecohatch/utils-api';

import { PrismaService } from '@/database';

import { IHealthService } from '../interfaces';
import { Health } from '../types';

/**
 * The service responsible for providing health information about the application.
 *
 * @class HealthService
 * @implements {IHealthService}
 */
@Injectable()
export class HealthService implements IHealthService {
  /**
   * Creates an instance of HealthService.
   *
   * @constructor
   * @param translatorService - The translator service
   * @param prismaService - The Prisma service
   */
  public constructor(
    @Inject(TRANSLATOR_SERVICE)
    private readonly _translatorService: ITranslatorService,
    private readonly _prismaService: PrismaService
  ) {}

  /**
   * Returns the health information about the application.
   *
   * @returns The health information about the application.
   */
  public async health(): Promise<Health> {
    const isDatabaseHealthy = await this._prismaService.ping();
    return {
      message: 'health.success.Server_is_up_and_running',
      status: this._translatorService.t('common.success.ok'),
      database: {
        message: isDatabaseHealthy
          ? this._translatorService.t('health.success.Database_is_connected')
          : this._translatorService.t(
              'health.error.Database_connection_failed'
            ),
        status: isDatabaseHealthy
          ? this._translatorService.t('common.success.ok')
          : this._translatorService.t('common.error.Unavailable'),
      },
    };
  }
}
