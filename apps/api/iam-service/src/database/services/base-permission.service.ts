import { Injectable } from '@nestjs/common';
import { BasePrismaService } from '@ecohatch/utils-api';
import { Permission, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

/**
 * The BasePermissionService class provides methods for managing permissions.
 * It extends the BasePrismaService class and provides methods for interacting
 * with the database for permission entity.
 *
 * @class BasePermissionService
 * @extends {BasePrismaService}
 */
@Injectable()
export class BasePermissionService extends BasePrismaService<
  Permission,
  'permission',
  Prisma.PermissionCreateInput,
  Prisma.PermissionUpdateInput,
  Prisma.PermissionWhereInput,
  Prisma.PermissionSelect,
  Prisma.PermissionInclude,
  Prisma.PermissionOrderByWithRelationInput,
  any,
  Prisma.PermissionScalarFieldEnum
> {
  public constructor(prismaService: PrismaService) {
    super(prismaService, 'permission');
  }
}
