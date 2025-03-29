import { OffsetPaginatedResult } from '@ecohatch/types-shared';
import { IBasePrismaService } from '@ecohatch/utils-api';
import { Permission, Prisma } from '@prisma/client';

import { GetPermissionListDto } from '../dtos';

export interface IPermissionService
  extends IBasePrismaService<
    Permission,
    'permission',
    Prisma.PermissionCreateInput,
    Prisma.PermissionUpdateInput,
    Prisma.PermissionWhereInput,
    Prisma.PermissionSelect,
    Prisma.PermissionInclude,
    Prisma.PermissionOrderByWithRelationInput[],
    any,
    Prisma.PermissionScalarFieldEnum
  > {
  findAll(
    query: GetPermissionListDto
  ): Promise<Permission[] | OffsetPaginatedResult<Permission>>;
}
