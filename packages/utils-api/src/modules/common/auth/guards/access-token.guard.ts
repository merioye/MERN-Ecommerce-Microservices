import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { NotAuthorizedError } from '../../../../common/errors';
import { ILogger, LOGGER } from '../../logger';
import { ACCESS_TOKEN_STRATEGY, IS_PUBLIC_DECORATOR_KEY } from '../constants';

/**
 * JWT authentication guard for access token
 * @class AccessTokenGuard
 * @extends {AuthGuard}
 */
@Injectable()
export class AccessTokenGuard extends AuthGuard(ACCESS_TOKEN_STRATEGY) {
  public constructor(
    private readonly _reflector: Reflector,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {
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
    // Check if route is public
    const isPublic = this._reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_DECORATOR_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (isPublic) {
      return true;
    }

    // Delegate to parent AuthGuard
    try {
      return super.canActivate(context);
    } catch (error) {
      this._logger.error(
        `AccessTokenGuard: JWT authentication failed: `,
        error
      );
      throw new NotAuthorizedError(
        'auth.error.Access_token_expired_or_invalid'
      );
    }
  }

  /**
   * Handles request
   * @param {Error} err - Error object
   * @param {AuthRequestUser | null } user - User object
   * @param {any} info - Additional info
   * @returns {AuthRequestUser} Processed user object
   */
  public handleRequest<AuthRequestUser>(
    err: Error,
    user: AuthRequestUser | null,
    info: any
  ): AuthRequestUser {
    if (err || !user) {
      this._logger.error(
        `AccessTokenGuard: JWT authentication failed: `,
        err || info
      );
      throw new NotAuthorizedError(
        'auth.error.Access_token_expired_or_invalid'
      );
    }

    return user;
  }
}
