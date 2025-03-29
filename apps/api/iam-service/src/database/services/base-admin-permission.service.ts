import { Injectable } from '@nestjs/common';
import { BasePrismaService } from '@ecohatch/utils-api';
import { AdminPermission, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

/**
 * The BaseAdminPermissionService class provides methods for managing admin permissions.
 * It extends the BasePrismaService class and provides methods for interacting
 * with the database for admin permission entity.
 *
 * @class BaseAdminPermissionService
 * @extends {BasePrismaService}
 */
@Injectable()
export class BaseAdminPermissionService extends BasePrismaService<
  AdminPermission,
  'adminPermission',
  Prisma.AdminPermissionCreateInput,
  Prisma.AdminPermissionUpdateInput,
  Prisma.AdminPermissionWhereInput,
  Prisma.AdminPermissionSelect,
  Prisma.AdminPermissionInclude,
  Prisma.AdminPermissionOrderByWithRelationInput[],
  any,
  Prisma.AdminPermissionScalarFieldEnum
> {
  public constructor(prismaService: PrismaService) {
    super(prismaService, 'adminPermission');
  }
}
