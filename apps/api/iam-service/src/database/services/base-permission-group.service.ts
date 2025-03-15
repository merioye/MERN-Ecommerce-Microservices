import { Injectable } from '@nestjs/common';
import { BasePrismaService } from '@ecohatch/utils-api';
import { PermissionGroup, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

/**
 * The BasePermissionGroupService class provides methods for managing permission groups.
 * It extends the BasePrismaService class and provides methods for interacting
 * with the database for permission group entity.
 *
 * @class BasePermissionGroupService
 * @extends {BasePrismaService}
 */
@Injectable()
export class BasePermissionGroupService extends BasePrismaService<
  PermissionGroup,
  'permissionGroup',
  Prisma.PermissionGroupCreateInput,
  Prisma.PermissionGroupUpdateInput,
  Prisma.PermissionGroupWhereInput,
  Prisma.PermissionGroupSelect,
  Prisma.PermissionGroupInclude,
  Prisma.PermissionGroupOrderByWithRelationInput,
  any,
  Prisma.PermissionGroupScalarFieldEnum
> {
  public constructor(prismaService: PrismaService) {
    super(prismaService, 'permissionGroup');
  }
}
