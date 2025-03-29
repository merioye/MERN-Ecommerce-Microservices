import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { NotAuthorizedError } from '../../../../common/errors';
import { ILogger, LOGGER } from '../../logger';
import { REFRESH_TOKEN_STRATEGY } from '../constants';

/**
 * JWT authentication guard for refresh token
 * @class RefreshTokenGuard
 * @extends {AuthGuard}
 */
@Injectable()
export class RefreshTokenGuard extends AuthGuard(REFRESH_TOKEN_STRATEGY) {
  public constructor(@Inject(LOGGER) private readonly _logger: ILogger) {
    super();
  }

  /**
   * Checks if request can be activated
   * @param {ExecutionContext} context - Execution context
   * @returns {boolean | Promise<boolean> | Observable<boolean>} Whether the request can be activated
   */
  public canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Delegate to parent AuthGuard
    try {
      return super.canActivate(context);
    } catch (error) {
      this._logger.error(
        `RefreshTokenGuard: JWT authentication failed: `,
        error
      );
      throw new NotAuthorizedError(
        'auth.error.Refresh_token_expired_or_invalid'
      );
    }
  }

  /**
   * Handles request
   * @param {Error} err - Error object
   * @param {RefreshTokenPayload | null } payload - Refresh token payload
   * @param {any} info - Additional info
   * @returns {RefreshTokenPayload} Processed refresh token payload
   */
  public handleRequest<RefreshTokenPayload>(
    err: Error,
    payload: RefreshTokenPayload | null,
    info: { message?: string }
  ): RefreshTokenPayload {
    if (err || !payload) {
      this._logger.error(
        `RefreshTokenGuard: JWT authentication failed: `,
        err || info
      );
      throw new NotAuthorizedError(
        'auth.error.Refresh_token_expired_or_invalid'
      );
    }

    return payload;
  }
}
