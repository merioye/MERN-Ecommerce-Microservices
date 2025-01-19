/**
 * Interface defining the methods of the logger
 *
 *
 * @interface ILogger
 *
 * @method log - Logs a message
 * @method info - Logs an informational message
 * @method debug - Logs a debug message
 * @method error - Logs an error message
 * @method verbose - An Optional method that logs a verbose message
 * @method warn - An Optional method that logs a warning message
 */
export interface ILogger {
  log(message: any, metadata?: any): void;
  info(message: any, metadata?: any): void;
  debug(message: any, metadata?: any): void;
  error(message: any, metadata?: any): void;
  verbose(message: any, metadata?: any): void;
  warn(message: any, metadata?: any): void;
}
