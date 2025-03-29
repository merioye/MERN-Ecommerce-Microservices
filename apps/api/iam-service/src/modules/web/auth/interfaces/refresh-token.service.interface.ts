import { IBasePrismaService } from '@ecohatch/utils-api';
import { Prisma, RefreshToken } from '@prisma/client';

export interface IRefreshTokenService
  extends IBasePrismaService<
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
  persist(userAccountId: number, deviceId: number): Promise<RefreshToken>;
}
