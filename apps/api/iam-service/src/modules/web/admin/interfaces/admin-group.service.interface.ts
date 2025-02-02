import { OffsetPaginatedResult } from '@ecohatch/types-shared';
import { AdminGroup } from '@prisma/client';

import {
  CreateAdminGroupDto,
  GetAdminGroupListDto,
  UpdateAdminGroupDto,
} from '../dtos';

export interface IAdminGroupService {
  createOne(data: CreateAdminGroupDto): Promise<AdminGroup>;
  updateOne(id: number, data: UpdateAdminGroupDto): Promise<AdminGroup>;
  softDeleteOne(id: number): Promise<AdminGroup>;
  hardDeleteOne(id: number): Promise<AdminGroup>;
  restoreOne(id: number): Promise<AdminGroup>;
  findAll(
    query: GetAdminGroupListDto
  ): Promise<AdminGroup[] | OffsetPaginatedResult<AdminGroup>>;
}
