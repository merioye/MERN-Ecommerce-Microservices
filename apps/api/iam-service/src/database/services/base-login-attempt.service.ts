import { Injectable } from '@nestjs/common';
import { BasePrismaService } from '@ecohatch/utils-api';
import { LoginAttempt, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

/**
 * The BaseLoginAttemptService class provides methods for managing login attempts.
 * It extends the BasePrismaService class and provides methods for interacting
 * with the database for login attempt entity.
 *
 * @class BaseLoginAttemptService
 * @extends {BasePrismaService}
 */
@Injectable()
export class BaseLoginAttemptService extends BasePrismaService<
  LoginAttempt,
  'loginAttempt',
  Prisma.LoginAttemptCreateInput,
  Prisma.LoginAttemptUpdateInput,
  Prisma.LoginAttemptWhereInput,
  Prisma.LoginAttemptSelect,
  Prisma.LoginAttemptInclude,
  Prisma.LoginAttemptOrderByWithRelationInput[],
  any,
  Prisma.LoginAttemptScalarFieldEnum
> {
  public constructor(prismaService: PrismaService) {
    super(prismaService, 'loginAttempt');
  }
}
