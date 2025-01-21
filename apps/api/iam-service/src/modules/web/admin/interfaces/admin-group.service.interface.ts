import { AdminGroup } from '@prisma/client';

import { CreateAdminGroupDto, UpdateAdminGroupDto } from '../dtos';

export interface IAdminGroupService {
  create(data: CreateAdminGroupDto): Promise<AdminGroup>;
  updateOne(id: number, data: UpdateAdminGroupDto): Promise<AdminGroup>;
  softDeleteOne(id: number): Promise<AdminGroup>;
}
