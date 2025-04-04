import { Injectable } from '@nestjs/common';
import { BasePrismaService } from '@ecohatch/utils-api';
import { Prisma, UserAccount } from '@prisma/client';

import { PrismaService } from '../prisma.service';

/**
 * The BaseUserAccountService class provides methods for managing user accounts.
 * It extends the BasePrismaService class and provides methods for interacting
 * with the database for user account entity.
 *
 * @class BaseUserAccountService
 * @extends {BasePrismaService}
 */
@Injectable()
export class BaseUserAccountService extends BasePrismaService<
  UserAccount,
  'userAccount',
  Prisma.UserAccountCreateInput,
  Prisma.UserAccountUpdateInput,
  Prisma.UserAccountWhereInput,
  Prisma.UserAccountSelect,
  Prisma.UserAccountInclude,
  Prisma.UserAccountOrderByWithRelationInput[],
  any,
  Prisma.UserAccountScalarFieldEnum
> {
  public constructor(prismaService: PrismaService) {
    super(prismaService, 'userAccount');
  }
}
