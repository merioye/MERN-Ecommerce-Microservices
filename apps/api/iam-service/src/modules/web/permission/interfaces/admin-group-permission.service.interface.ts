import { EntityPrimaryKey, IBasePrismaService } from '@ecohatch/utils-api';
import { AdminGroupPermission, Permission, Prisma } from '@prisma/client';

import { AssignUserGroupPermissionDto } from '../dtos';

export interface IAdminGroupPermissionService
  extends IBasePrismaService<
    AdminGroupPermission,
    'adminGroupPermission',
    Prisma.AdminGroupPermissionCreateInput,
    Prisma.AdminGroupPermissionUpdateInput,
    Prisma.AdminGroupPermissionWhereInput,
    Prisma.AdminGroupPermissionSelect,
    Prisma.AdminGroupPermissionInclude,
    Prisma.AdminGroupPermissionOrderByWithRelationInput[],
    any,
    Prisma.AdminGroupPermissionScalarFieldEnum
  > {
  assign(
    data: AssignUserGroupPermissionDto,
    actionByUserAccountId: EntityPrimaryKey
  ): Promise<AdminGroupPermission[]>;
  findAll(adminGroupId: EntityPrimaryKey): Promise<Permission[]>;
  revoke(
    adminGroupId: EntityPrimaryKey,
    permissionId: EntityPrimaryKey
  ): Promise<void>;
}
