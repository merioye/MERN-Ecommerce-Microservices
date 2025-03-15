import { Inject, Injectable } from '@nestjs/common';
import {
  EntityPrimaryKey,
  ILogger,
  LOGGER,
  NotFoundError,
} from '@ecohatch/utils-api';
import { AdminPermission, Permission } from '@prisma/client';

import { BaseAdminPermissionService, PrismaService } from '@/database';

import { ADMIN_SERVICE } from '../../admin/constants';
import { IAdminService } from '../../admin/interfaces';
import { PERMISSION_SERVICE } from '../constants';
import { AssignUserPermissionDto } from '../dtos';
import { IAdminPermissionService, IPermissionService } from '../interfaces';

/**
 * Service for managing admin user permissions.
 * This service handles assigning, retrieving, and revoking permissions for admin users.
 *
 * @class AdminPermissionService
 * @extends {BaseAdminPermissionService}
 * @implements {IAdminPermissionService}
 */
@Injectable()
export class AdminPermissionService
  extends BaseAdminPermissionService
  implements IAdminPermissionService
{
  public constructor(
    prismaService: PrismaService,
    @Inject(ADMIN_SERVICE) private readonly _adminService: IAdminService,
    @Inject(PERMISSION_SERVICE)
    private readonly _permissionService: IPermissionService,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {
    super(prismaService);
  }

  /**
   * Assigns permissions to an admin user.
   *
   * @param {AssignUserPermissionDto} data - The data containing the admin user ID and permission IDs.
   * @returns {Promise<AdminPermission[]>} - The assigned permissions.
   * @throws {NotFoundError} If the admin user is not found.
   */
  public async assign(
    data: AssignUserPermissionDto
  ): Promise<AdminPermission[]> {
    // Check if admin exists
    const admin = await this._adminService.findById(
      data.userId as unknown as EntityPrimaryKey
    );
    if (!admin) {
      throw new NotFoundError('admin.error.Admin_not_found');
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
      adminId: admin.id,
      permissionId: permission.id,
    }));

    // Use transaction to ensure all or nothing
    return await this.transaction(async (transaction) => {
      // First, delete any existing permissions that match the admin ID
      await transaction.adminPermission.deleteMany({
        where: {
          adminId: admin.id,
        },
      });

      // Then create new permissions
      return await Promise.all(
        createData.map((item) => {
          return transaction.adminPermission.create({
            data: item,
          });
        })
      );
    });
  }

  /**
   * Retrieves all permissions assigned to an admin user.
   *
   * @param {EntityPrimaryKey} adminId - The ID of the admin user.
   * @returns {Promise<Permission[]>} - A list of permissions.
   */
  public async findAll(adminId: EntityPrimaryKey): Promise<Permission[]> {
    // First, get the admin including their directly assigned permissions
    const adminWithPermissions = await this._adminService.model.findUnique({
      where: { id: this.parseId(adminId) },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        adminGroup: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!adminWithPermissions) {
      this._logger.warn(`Admin not found with ID: ${adminId}`);
      return [];
    }

    // Collect direct permissions
    const directPermissions = adminWithPermissions.permissions.map(
      (adminPermission) => adminPermission.permission
    );

    // Collect permissions from admin group
    const groupPermissions = adminWithPermissions.adminGroup.permissions.map(
      (groupPermission) => groupPermission.permission
    );

    // Combine both sets of permissions, ensuring no duplicates by using a Map with permission ID as key
    const permissionsMap = new Map<number, Permission>();

    [...directPermissions, ...groupPermissions].forEach((permission) => {
      permissionsMap.set(permission.id, permission);
    });

    // Convert Map back to array
    const allPermissions = Array.from(permissionsMap.values());

    return allPermissions;
  }

  /**
   * Revokes a specific permission from an admin user.
   *
   * @param {EntityPrimaryKey} adminId - The ID of the admin user.
   * @param {EntityPrimaryKey} permissionId - The ID of the permission to revoke.
   * @returns {Promise<void>}
   * @throws {NotFoundError} If the admin user or permission is not found.
   */
  public async revoke(
    adminId: EntityPrimaryKey,
    permissionId: EntityPrimaryKey
  ): Promise<void> {
    // Check if admin exists
    const admin = await this._adminService.findById(adminId);
    if (!admin) {
      throw new NotFoundError('admin.error.Admin_not_found');
    }

    // Check if permission exists
    const permission = await this._permissionService.findById(permissionId);
    if (!permission) {
      throw new NotFoundError('permission.error.Permission_not_found');
    }

    // Revoke permission
    await this.delete({
      adminId: this.parseId(adminId),
      permissionId: this.parseId(permissionId),
    });
  }
}
