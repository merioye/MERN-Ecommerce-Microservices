import { OffsetPaginatedResult } from '@ecohatch/types-shared';
import { EntityPrimaryKey, IBasePrismaService } from '@ecohatch/utils-api';
import { AdminGroup, Prisma } from '@prisma/client';

import {
  CreateAdminGroupDto,
  GetAdminGroupListDto,
  UpdateAdminGroupDto,
} from '../dtos';

export interface IAdminGroupService
  extends IBasePrismaService<
    AdminGroup,
    Prisma.AdminGroupCreateInput,
    Prisma.AdminGroupUpdateInput,
    Prisma.AdminGroupWhereInput,
    Prisma.AdminGroupSelect,
    Prisma.AdminGroupInclude,
    Prisma.AdminGroupOrderByWithRelationInput,
    any,
    Prisma.AdminGroupScalarFieldEnum
  > {
  createOne(data: CreateAdminGroupDto): Promise<AdminGroup>;
  updateOne(
    id: EntityPrimaryKey,
    data: UpdateAdminGroupDto
  ): Promise<AdminGroup>;
  softDeleteOne(id: EntityPrimaryKey): Promise<AdminGroup>;
  hardDeleteOne(id: EntityPrimaryKey): Promise<AdminGroup>;
  restoreOne(id: EntityPrimaryKey): Promise<AdminGroup>;
  findAll(
    query: GetAdminGroupListDto
  ): Promise<AdminGroup[] | OffsetPaginatedResult<AdminGroup>>;
  findBySlug(slug: string): Promise<AdminGroup | null>;
}
