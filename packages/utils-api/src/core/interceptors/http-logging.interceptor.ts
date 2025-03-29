import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { CustomRequest } from '../../modules/common/auth';
import { ILogger, LOGGER } from '../../modules/common/logger';

/**
 * Interceptor for logging HTTP requests and responses
 *
 * @class HttpLoggingInterceptor
 * @implements {NestInterceptor}
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  public constructor(@Inject(LOGGER) private readonly _logger: ILogger) {}

  /**
   * Intercepts HTTP requests and responses for logging
   *
   * @param {ExecutionContext} context - The execution context
   * @param {CallHandler} next - The next handler in the chain
   * @returns {Observable<any>} - Observable of the response
   */
  public intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> {
    const req = context.switchToHttp().getRequest<CustomRequest>();
    const { method, url, ip } = req;
    const userAgent = req.headers['user-agent'] || '';
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      this.generateCorrelationId();

    req.correlationId = correlationId;

    const startTime = Date.now();
    this._logger.info(
      `[${correlationId}] ${method} ${url} - IP: ${ip} - UserAgent: ${userAgent}`
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const endTime = Date.now();
          this._logger.info(
            `[${correlationId}] ${method} ${url} - ${endTime - startTime}ms - Success`
          );
        },
        error: (error: Error) => {
          const endTime = Date.now();
          this._logger.error(
            `[${correlationId}] ${method} ${url} - ${endTime - startTime}ms - Error: ${error?.message}`,
            error?.stack
          );
        },
      })
    );
  }

  /**
   * Generates a correlation ID
   *
   * @returns {string} - Generated correlation ID
   */
  private generateCorrelationId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
