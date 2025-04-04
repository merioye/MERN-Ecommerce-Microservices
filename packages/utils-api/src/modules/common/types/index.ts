import { BaseAuthModuleOptions } from '../auth';
import { CacheModuleOptions } from '../cache';
import { CronJobModuleOptions } from '../cron-job';
import { LoggerModuleOptions } from '../logger';
import { TranslatorModuleOptions } from '../translator';

/**
 * Type representing the CommonAppModuleOptions.
 *
 * @typedef CommonAppModuleOptions
 *
 * @property {LoggerModuleOptions} logger - The logger module options.
 * @property {TranslatorModuleOptions} translator - The translator module options.
 * @property {CacheModuleOptions} cache - The cache module options.
 */
export type CommonAppModuleOptions = {
  logger: LoggerModuleOptions;
  translator: TranslatorModuleOptions;
  cache: CacheModuleOptions;
  cronJob: CronJobModuleOptions;
  baseAuth: BaseAuthModuleOptions;
};
