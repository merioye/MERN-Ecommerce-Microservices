import { DynamicModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ILogger, LOGGER } from '../logger';
import { CRON_JOB_SCHEDULER, CRON_JOB_SERVICE, CRON_JOBS } from './constants';
import { ICronJobScheduler } from './interfaces';
import { NestScheduleScheduler } from './schedulers';
import { CronJobService } from './services';
import { CronJobConfig, CronJobModuleOptions } from './types';

/**
 * Global Cron Job Module for NestJS
 * @module CronJobModule
 */
@Module({})
export class CronJobModule {
  /**
   * Registers the CronJobModule with the provided options
   * @param options - Options to configure the cron job module
   * @returns {DynamicModule} Configured NestJS dynamic module
   */
  static register(options: CronJobModuleOptions): DynamicModule {
    return {
      global: true,
      module: CronJobModule,
      imports: [ScheduleModule.forRoot()],
      providers: [
        {
          provide: CRON_JOB_SCHEDULER,
          useClass: NestScheduleScheduler,
        },
        {
          provide: CRON_JOBS,
          useValue: options.jobs || [],
        },
        {
          provide: CRON_JOB_SERVICE,
          useFactory: (
            logger: ILogger,
            scheduler: ICronJobScheduler,
            jobs: CronJobConfig[]
          ) =>
            new CronJobService(logger, scheduler, jobs, options.globalOptions),
          inject: [LOGGER, CRON_JOB_SCHEDULER, CRON_JOBS],
        },
      ],
      exports: [CRON_JOB_SERVICE],
    };
  }
}
