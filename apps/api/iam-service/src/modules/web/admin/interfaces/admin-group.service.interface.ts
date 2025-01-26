import { AdminGroup } from '@prisma/client';

import { CreateAdminGroupDto, UpdateAdminGroupDto } from '../dtos';

export interface IAdminGroupService {
  createOne(data: CreateAdminGroupDto): Promise<AdminGroup>;
  updateOne(id: number, data: UpdateAdminGroupDto): Promise<AdminGroup>;
  softDeleteOne(id: number): Promise<AdminGroup>;
  hardDeleteOne(id: number): Promise<AdminGroup>;
  restoreOne(id: number): Promise<AdminGroup>;
}
