import { Injectable } from '@nestjs/common';
import { BasePrismaService } from '@ecohatch/utils-api';
import { AdminGroupPermission, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

/**
 * The BaseAdminGroupPermissionService class provides methods for managing admin group permissions.
 * It extends the BasePrismaService class and provides methods for interacting
 * with the database for admin group permission entity.
 *
 * @class BaseAdminGroupPermissionService
 * @extends {BasePrismaService}
 */
@Injectable()
export class BaseAdminGroupPermissionService extends BasePrismaService<
  AdminGroupPermission,
  'adminGroupPermission',
  Prisma.AdminGroupPermissionCreateInput,
  Prisma.AdminGroupPermissionUpdateInput,
  Prisma.AdminGroupPermissionWhereInput,
  Prisma.AdminGroupPermissionSelect,
  Prisma.AdminGroupPermissionInclude,
  Prisma.AdminGroupPermissionOrderByWithRelationInput,
  any,
  Prisma.AdminGroupPermissionScalarFieldEnum
> {
  public constructor(prismaService: PrismaService) {
    super(prismaService, 'adminGroupPermission');
  }
}
