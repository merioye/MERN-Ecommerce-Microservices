import { AdminGroup } from '@prisma/client';

import { CreateAdminGroupDto } from '../dtos';

export interface IAdminGroupService {
  create(data: CreateAdminGroupDto): Promise<AdminGroup>;
}
