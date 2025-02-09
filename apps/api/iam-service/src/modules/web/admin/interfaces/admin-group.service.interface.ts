import { OffsetPaginatedResult } from '@ecohatch/types-shared';
import { AdminGroup, Prisma } from '@prisma/client';

import { IBasePrismaService } from '@/database';

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
    Prisma.AdminGroupScalarFieldEnum
  > {
  createOne(data: CreateAdminGroupDto): Promise<AdminGroup>;
  updateOne(id: number, data: UpdateAdminGroupDto): Promise<AdminGroup>;
  softDeleteOne(id: number): Promise<AdminGroup>;
  hardDeleteOne(id: number): Promise<AdminGroup>;
  restoreOne(id: number): Promise<AdminGroup>;
  findAll(
    query: GetAdminGroupListDto
  ): Promise<AdminGroup[] | OffsetPaginatedResult<AdminGroup>>;
  findBySlug(slug: string): Promise<AdminGroup | null>;
}
