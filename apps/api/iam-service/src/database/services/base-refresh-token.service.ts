import { Injectable } from '@nestjs/common';
import { BasePrismaService } from '@ecohatch/utils-api';
import { Prisma, RefreshToken } from '@prisma/client';

import { PrismaService } from '../prisma.service';

/**
 * The BaseRefreshTokenService class provides methods for managing refresh tokens.
 * It extends the BasePrismaService class and provides methods for interacting
 * with the database for refresh token entity.
 *
 * @class BaseRefreshTokenService
 * @extends {BasePrismaService}
 */
@Injectable()
export class BaseRefreshTokenService extends BasePrismaService<
  RefreshToken,
  'refreshToken',
  Prisma.RefreshTokenCreateInput,
  Prisma.RefreshTokenUpdateInput,
  Prisma.RefreshTokenWhereInput,
  Prisma.RefreshTokenSelect,
  Prisma.RefreshTokenInclude,
  Prisma.RefreshTokenOrderByWithRelationInput[],
  any,
  Prisma.RefreshTokenScalarFieldEnum
> {
  public constructor(prismaService: PrismaService) {
    super(prismaService, 'refreshToken');
  }
}
