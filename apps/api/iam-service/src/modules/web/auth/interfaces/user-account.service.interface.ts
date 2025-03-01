import { IBasePrismaService } from '@ecohatch/utils-api';
import { Prisma, UserAccount } from '@prisma/client';

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
    any,
    Prisma.UserAccountScalarFieldEnum
  > {
  createOne(data: CreateUserAccountDto): Promise<UserAccount>;
}
