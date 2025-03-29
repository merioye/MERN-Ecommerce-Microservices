import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  EntityPrimaryKey,
  ILogger,
  LOGGER,
  NotFoundError,
} from '@ecohatch/utils-api';
import { AdminGroupPermission, Permission } from '@prisma/client';

import { BaseAdminGroupPermissionService, PrismaService } from '@/database';

import { ADMIN_GROUP_SERVICE, IAdminGroupService } from '../../admin';
import { PERMISSION_SERVICE } from '../constants';
import { AssignUserGroupPermissionDto } from '../dtos';
import {
  IAdminGroupPermissionService,
  IPermissionService,
} from '../interfaces';

/**
 * Service for managing admin group permissions.
 * This service handles the assignment, retrieval, and revocation
 * of permissions associated with an admin group.
 *
 * @class AdminGroupPermissionService
 * @extends {BaseAdminGroupPermissionService}
 * @implements {IAdminGroupPermissionService}
 */
@Injectable()
export class AdminGroupPermissionService
  extends BaseAdminGroupPermissionService
  implements IAdminGroupPermissionService
{
  public constructor(
    prismaService: PrismaService,
    @Inject(PERMISSION_SERVICE)
    private readonly _permissionService: IPermissionService,
    @Inject(forwardRef(() => ADMIN_GROUP_SERVICE))
    private readonly _adminGroupService: IAdminGroupService,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {
    super(prismaService);
  }

  /**
   * Assigns permissions to an admin group.
   *
   * @param {AssignUserGroupPermissionDto} data - The data containing admin group ID and permission IDs.
   * @param {EntityPrimaryKey} actionByUserAccountId - The ID of the user account making the request.
   * @returns {Promise<AdminGroupPermission[]>} - The assigned permissions.
   * @throws {NotFoundError} If the admin group is not found.
   */
  public async assign(
    data: AssignUserGroupPermissionDto,
    actionByUserAccountId: EntityPrimaryKey
  ): Promise<AdminGroupPermission[]> {
    // Check if admin group exists
    const adminGroup = await this._adminGroupService.findById(
      data.userGroupId as unknown as EntityPrimaryKey
    );
    if (!adminGroup) {
      throw new NotFoundError('adminGroup.error.Admin_group_not_found');
    }

    // Check all permissions that exist
    const foundPermissions = await this._permissionService.findMany({
      where: {
        id: {
          in: data.permissionIds,
        },
      },
    });

    // Create permissions in batch
    const createData = foundPermissions.map((permission) => ({
      adminGroupId: data.userGroupId,
      permissionId: permission.id,
      createdBy: this.parseId(actionByUserAccountId),
      updatedBy: this.parseId(actionByUserAccountId),
    }));

    // Use transaction to ensure all or nothing
    return await this.transaction(async (transaction) => {
      // First, delete any existing permissions that match the adminGroup ID
      await transaction.adminGroupPermission.deleteMany({
        where: {
          adminGroupId: data.userGroupId,
        },
      });

      // Then create new permissions
      return await Promise.all(
        createData.map((item) => {
          return transaction.adminGroupPermission.create({
            data: item,
          });
        })
      );
    });
  }

  /**
   * Retrieves all permissions associated with an admin group.
   *
   * @param {EntityPrimaryKey} adminGroupId - The ID of the admin group.
   * @returns {Promise<Permission[]>} - A list of permissions.
   */
  public async findAll(adminGroupId: EntityPrimaryKey): Promise<Permission[]> {
    // Get the admin group with its permissions
    const adminGroup = await this._adminGroupService.model.findUnique({
      where: { id: this.parseId(adminGroupId) },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    if (!adminGroup) {
      this._logger.warn(`Admin group not found with ID: ${adminGroupId}`);
      return [];
    }

    // Extract just the permission objects from the AdminGroupPermission entries
    const groupPermissions = adminGroup.permissions.map(
      (groupPermission) => groupPermission.permission
    );

    return groupPermissions;
  }

  /**
   * Revokes a specific permission from an admin group.
   *
   * @param {EntityPrimaryKey} adminGroupId - The ID of the admin group.
   * @param {EntityPrimaryKey} permissionId - The ID of the permission to revoke.
   * @returns {Promise<void>}
   * @throws {NotFoundError} If the admin group or permission is not found.
   */
  public async revoke(
    adminGroupId: EntityPrimaryKey,
    permissionId: EntityPrimaryKey
  ): Promise<void> {
    // Check if admin group exists
    const adminGroup = await this._adminGroupService.findById(adminGroupId);
    if (!adminGroup) {
      throw new NotFoundError('adminGroup.error.Admin_group_not_found');
    }

    // Check if permission exists
    const permission = await this._permissionService.findById(permissionId);
    if (!permission) {
      throw new NotFoundError('permission.error.Permission_not_found');
    }

    // Revoke permission
    await this.model.delete({
      where: {
        adminGroupId_permissionId: {
          adminGroupId: this.parseId(adminGroupId),
          permissionId: this.parseId(permissionId),
        },
      },
    });
  }
}
