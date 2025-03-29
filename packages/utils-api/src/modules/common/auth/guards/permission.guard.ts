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
import { PERMISSION_DECORATOR_KEY } from '../constants';
import { CustomRequest, RequiredPermission } from '../types';

/**
 * Guard to check if the user has the required permissions
 *
 * @class PermissionGuard
 * @implements {CanActivate}
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  public constructor(
    private readonly _reflector: Reflector,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {}

  /**
   * Checks if the user has the required permissions
   * @param {ExecutionContext} context - The execution context
   * @returns {boolean} - True if the user has the required permissions, false otherwise
   */
  public canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this._reflector.getAllAndOverride<
      RequiredPermission[]
    >(PERMISSION_DECORATOR_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || !requiredPermissions.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<CustomRequest>();
    if (!user) {
      this._logger.warn('PermissionGuard: User not found in request');
      throw new NotAuthorizedError('auth.error.User_not_authenticated');
    }
    if (user.role === Role.ADMIN) {
      this._logger.info(
        'PermissionGuard: User is admin, skipping permission check'
      );
      return true;
    }

    const hasPermission = requiredPermissions.every((permission) => {
      const { action, resource } = permission;
      const permissionSlug = `${action.toLowerCase()}-${resource.toLowerCase().split(' ').join('-')}`;
      return user.permissions.includes(permissionSlug);
    });

    if (hasPermission) {
      this._logger.info(
        `PermissionGuard: User ${user.email} granted ${requiredPermissions[0]?.action} permission on ${requiredPermissions[0]?.resource}`
      );
      return true;
    } else {
      this._logger.warn(
        `PermissionGuard: User ${user.email} denied ${requiredPermissions[0]?.action} permission on ${requiredPermissions[0]?.resource}`
      );
      throw new ForbiddenError('auth.error.Insufficient_permissions');
    }
  }
}
