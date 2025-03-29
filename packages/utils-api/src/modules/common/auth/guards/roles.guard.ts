import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@ecohatch/utils-shared';

import { ForbiddenError, NotAuthorizedError } from '../../../../common/errors';
import { ILogger, LOGGER } from '../../logger';
import { ROLES_DECORATOR_KEY } from '../constants';
import { CustomRequest } from '../types';

/**
 * Role-based authorization guard
 * @class RolesGuard
 * @implements {CanActivate}
 */
@Injectable()
export class RolesGuard implements CanActivate {
  public constructor(
    private readonly _reflector: Reflector,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {}

  /**
   * Check if request can be activated based on user role
   * @param {ExecutionContext} context - Execution context
   * @returns {boolean} Whether the request can be activated
   */
  public canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this._reflector.getAllAndOverride<Role[]>(
      ROLES_DECORATOR_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<CustomRequest>();
    if (!user) {
      this._logger.warn('RolesGuard: No user found in request');
      throw new NotAuthorizedError('auth.error.User_not_authenticated');
    }
    if (user.role === Role.ADMIN) {
      this._logger.info('RolesGuard: User is admin, skipping role check');
      return true;
    }

    const hasRequiredRole = requiredRoles.some((role) => role === user.role);

    if (!hasRequiredRole) {
      this._logger.warn(
        `RolesGuard: User ${user.email} does not have required roles: ${requiredRoles.join(', ')}`
      );
      throw new ForbiddenError('auth.error.Insufficient_permissions');
    }

    return true;
  }
}
