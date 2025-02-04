import {
  CacheModuleOptions,
  LoggerModuleOptions,
  TranslatorModuleOptions,
} from '@/types';

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
};
