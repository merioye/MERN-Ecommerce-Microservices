import { EntityPrimaryKey, IBasePrismaService } from '@ecohatch/utils-api';
import { AdminPermission, Permission, Prisma } from '@prisma/client';

import { AssignUserPermissionDto } from '../dtos';

export interface IAdminPermissionService
  extends IBasePrismaService<
    AdminPermission,
    'adminPermission',
    Prisma.AdminPermissionCreateInput,
    Prisma.AdminPermissionUpdateInput,
    Prisma.AdminPermissionWhereInput,
    Prisma.AdminPermissionSelect,
    Prisma.AdminPermissionInclude,
    Prisma.AdminPermissionOrderByWithRelationInput[],
    any,
    Prisma.AdminPermissionScalarFieldEnum
  > {
  assign(
    data: AssignUserPermissionDto,
    actionByUserAccountId: EntityPrimaryKey
  ): Promise<AdminPermission[]>;
  findAll(adminId: EntityPrimaryKey): Promise<Permission[]>;
  revoke(
    adminId: EntityPrimaryKey,
    permissionId: EntityPrimaryKey
  ): Promise<void>;
}
