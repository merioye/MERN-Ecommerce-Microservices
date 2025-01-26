import { Injectable } from '@nestjs/common';
import { AdminGroup, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { BasePrismaService } from './base-prisma.service';

@Injectable()
export class BaseAdminGroupService extends BasePrismaService<
  AdminGroup,
  'adminGroup',
  Prisma.AdminGroupCreateInput,
  Prisma.AdminGroupUpdateInput,
  Prisma.AdminGroupWhereInput,
  Prisma.AdminGroupSelect,
  any, // TODO: Add proper type for include when added the relations in UserGroup model
  Prisma.AdminGroupOrderByWithRelationInput,
  Prisma.AdminGroupScalarFieldEnum
> {
  public constructor(prismaService: PrismaService) {
    super(prismaService, 'adminGroup');
  }
}
