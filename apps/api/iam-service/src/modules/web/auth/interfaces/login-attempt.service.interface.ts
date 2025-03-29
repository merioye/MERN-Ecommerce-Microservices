import { IBasePrismaService } from '@ecohatch/utils-api';
import { LoginAttempt, Prisma } from '@prisma/client';

export interface ILoginAttemptService
  extends IBasePrismaService<
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
  isUserLockedOut(userAccountId: number, ipAddress: string): Promise<boolean>;
  recordLoginAttempt(
    userAccountId: number,
    ipAddress: string
  ): Promise<LoginAttempt>;
}
