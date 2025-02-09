import { Injectable } from '@nestjs/common';
import { Admin, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { BasePrismaService } from './base-prisma.service';

/**
 * The BaseAdminService class provides methods for managing admins.
 * It extends the BasePrismaService class and provides methods for interacting
 * with the database for admin entity.
 *
 * @class BaseAdminService
 * @extends {BasePrismaService}
 */
@Injectable()
export class BaseAdminService extends BasePrismaService<
  Admin,
  'admin',
  Prisma.AdminCreateInput,
  Prisma.AdminUpdateInput,
  Prisma.AdminWhereInput,
  Prisma.AdminSelect,
  Prisma.AdminInclude,
  Prisma.AdminOrderByWithRelationInput,
  Prisma.AdminScalarFieldEnum
> {
  public constructor(prismaService: PrismaService) {
    super(prismaService, 'admin');
  }
}
