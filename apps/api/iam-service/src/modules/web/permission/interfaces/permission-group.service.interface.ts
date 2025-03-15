import { OffsetPaginatedResult } from '@ecohatch/types-shared';
import { IBasePrismaService } from '@ecohatch/utils-api';
import { PermissionGroup, Prisma } from '@prisma/client';

import { GetPermissionListDto } from '../dtos';

export interface IPermissionGroupService
  extends IBasePrismaService<
    PermissionGroup,
    'permissionGroup',
    Prisma.PermissionGroupCreateInput,
    Prisma.PermissionGroupUpdateInput,
    Prisma.PermissionGroupWhereInput,
    Prisma.PermissionGroupSelect,
    Prisma.PermissionGroupInclude,
    Prisma.PermissionGroupOrderByWithRelationInput,
    any,
    Prisma.PermissionGroupScalarFieldEnum
  > {
  findAll(
    query: GetPermissionListDto
  ): Promise<PermissionGroup[] | OffsetPaginatedResult<PermissionGroup>>;
}
