import { Admin, Prisma } from '@prisma/client';

import { IBasePrismaService } from '@/database';

import { CreateAdminDto } from '../dtos';

export interface IAdminService
  extends IBasePrismaService<
    Admin,
    Prisma.AdminCreateInput,
    Prisma.AdminUpdateInput,
    Prisma.AdminWhereInput,
    Prisma.AdminSelect,
    Prisma.AdminInclude,
    Prisma.AdminOrderByWithRelationInput,
    Prisma.AdminScalarFieldEnum
  > {
  createOne(data: CreateAdminDto): Promise<Omit<Admin, 'password'>>;
}
