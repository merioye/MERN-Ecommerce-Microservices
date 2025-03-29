import { Injectable } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';

import { Environment } from '../../../../enums';
import { ILogger } from '../interfaces';
import { LoggerModuleOptions } from '../types';

/**
 * Singleton of Logger using Winston library which implements the ILogger interface
 *
 * @class WinstonLogger
 * @implements {ILogger}
 *
 * @example
 * const logger = WinstonLogger.getInstance();
 * logger.log('info', 'Hello, World!');
 */
@Injectable()
export class WinstonLogger implements ILogger {
  // Singleton logger instance
  private static _instance: WinstonLogger;
  // Winston logger
  private readonly _logger: Logger;
  private readonly _customFormat = {
    console: format.printf(
      ({ timestamp, level, stack, message, metadata }: any) => {
        let logMessage = `${timestamp} [${level}]: ${stack || message}`;

        // Handle metadata if present
        if (metadata) {
          logMessage += ` ${JSON.stringify(metadata)}`;
        }

        return logMessage;
      }
    ),
  };

  /**
   * Private constructor to create a singleton from within the class.
   * It cannot be instantiated outside of the class
   *
   * @constructor
   * @param options - Logger module options
   */
  private constructor({
    environment,
    logsDirPath,
    debugMode,
    appName,
  }: LoggerModuleOptions) {
    const isTestingEnvironment = environment === Environment.TEST;
    const logLevel = debugMode ? 'debug' : 'info';

    this._logger = createLogger({
      level: logLevel,
      defaultMeta: {
        application: appName,
      },
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json()
      ),
      transports: [
        new transports.Console({
          level: logLevel,
          silent: isTestingEnvironment,
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }),
            this._customFormat.console
          ),
        }),
        new transports.File({
          level: 'error',
          dirname: logsDirPath,
          filename: 'error.log',
          silent: isTestingEnvironment,
        }),
        new transports.File({
          level: logLevel,
          dirname: logsDirPath,
          filename: 'combined.log',
          silent: isTestingEnvironment,
        }),
      ],
    });
  }

  /**
   * Get the singleton instance of the logger
   *
   * @static
   * @param options - logger module options
   * @returns logger instance
   */
  public static getInstance(options: LoggerModuleOptions): WinstonLogger {
    if (!WinstonLogger._instance) {
      WinstonLogger._instance = new WinstonLogger(options);
    }
    return WinstonLogger._instance;
  }

  /**
   * Format message to string
   *
   * @param data - Message to format
   * @returns Formatted message
   */
  private stringify(data: any): string {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  /**
   * Logs a message
   *
   * @param message - Message to log
   * @param metadata - Optional extra metadata
   * @returns {void}
   */
  public log(message: any, metadata: any = null): void {
    this._logger.log('info', this.stringify(message), {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      metadata: metadata,
    });
  }

  /**
   * Logs an informational message
   *
   * @param message - Message to log
   * @param metadata - Optional extra metadata
   * @returns {void}
   */
  public info(message: any, metadata: any = null): void {
    this._logger.info(this.stringify(message), {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      metadata: metadata,
    });
  }

  /**
   * Logs a debug message
   *
   * @param message - Message to log
   * @param metadata - Optional extra metadata
   * @returns {void}
   */
  public debug(message: any, metadata: any = null): void {
    this._logger.debug(this.stringify(message), {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      metadata: metadata,
    });
  }

  /**
   * Logs a message at verbose level
   *
   * @param - Message message to log
   * @param metadata - Optional extra metadata
   * @returns {void}
   */
  public verbose(message: any, metadata: any = null): void {
    this._logger.verbose(this.stringify(message), {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      metadata: metadata,
    });
  }

  /**
   * Logs an error message
   *
   * @param message - Message to log
   * @param metadata - Optional extra metadata
   * @returns {void}
   */
  public error(message: any, metadata: any = null): void {
    this._logger.error(this.stringify(message), {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      metadata: metadata,
    });
  }

  /**
   * Logs a warning message
   *
   * @param message - Message to log
   * @param metadata - Optional extra metadata
   * @returns {void}
   */
  public warn(message: any, metadata: any = null): void {
    this._logger.warn(this.stringify(message), {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      metadata: metadata,
    });
  }
}
