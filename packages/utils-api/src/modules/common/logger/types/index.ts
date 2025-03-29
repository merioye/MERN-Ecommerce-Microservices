import { Environment } from '../../../../enums';

/**
 * Type representing the LoggerModuleOptions.
 *
 * @typedef LoggerModuleOptions
 *
 * @property {Environment} environment - The environment in which the application is running.
 * @property {string} logsDirPath - The path to the directory where logs will be stored.
 * @property {boolean} debugMode - Whether the application is running in debug mode.
 * @property {string} appName - The name of the application
 */
export type LoggerModuleOptions = {
  environment: Environment;
  logsDirPath: string;
  debugMode: boolean;
  appName: string;
};
