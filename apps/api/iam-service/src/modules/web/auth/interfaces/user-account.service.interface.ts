import { Prisma, UserAccount } from '@prisma/client';

import { IBasePrismaService } from '@/database';

import { CreateUserAccountDto } from '../dtos';

export interface IUserAccountService
  extends IBasePrismaService<
    UserAccount,
    Prisma.UserAccountCreateInput,
    Prisma.UserAccountUpdateInput,
    Prisma.UserAccountWhereInput,
    Prisma.UserAccountSelect,
    Prisma.UserAccountInclude,
    Prisma.UserAccountOrderByWithRelationInput,
    Prisma.UserAccountScalarFieldEnum
  > {
  createOne(data: CreateUserAccountDto): Promise<UserAccount>;
}
