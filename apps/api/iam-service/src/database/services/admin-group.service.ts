import { Injectable } from '@nestjs/common';
import { BasePrismaService } from '@ecohatch/utils-api';
import { AdminGroup, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

/**
 * The BaseAdminGroupService class provides methods for managing admin groups.
 * It extends the BasePrismaService class and provides methods for interacting
 * with the database for admin group entity.
 *
 * @class BaseAdminGroupService
 * @extends {BasePrismaService}
 */
@Injectable()
export class BaseAdminGroupService extends BasePrismaService<
  AdminGroup,
  'adminGroup',
  Prisma.AdminGroupCreateInput,
  Prisma.AdminGroupUpdateInput,
  Prisma.AdminGroupWhereInput,
  Prisma.AdminGroupSelect,
  Prisma.AdminGroupInclude,
  Prisma.AdminGroupOrderByWithRelationInput[],
  any,
  Prisma.AdminGroupScalarFieldEnum
> {
  public constructor(prismaService: PrismaService) {
    super(prismaService, 'adminGroup');
  }
}
