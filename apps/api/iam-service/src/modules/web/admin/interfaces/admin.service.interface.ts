import { IBasePrismaService } from '@ecohatch/utils-api';
import { Admin, Prisma } from '@prisma/client';

import { CreateAdminDto } from '../dtos';

export interface IAdminService
  extends IBasePrismaService<
    Admin,
    'admin',
    Prisma.AdminCreateInput,
    Prisma.AdminUpdateInput,
    Prisma.AdminWhereInput,
    Prisma.AdminSelect,
    Prisma.AdminInclude,
    Prisma.AdminOrderByWithRelationInput,
    any,
    Prisma.AdminScalarFieldEnum
  > {
  createOne(data: CreateAdminDto): Promise<Omit<Admin, 'password'>>;
}
