import { Injectable } from '@nestjs/common';
import { UserAccount } from '@prisma/client';

import { BaseUserAccountService, PrismaService } from '@/database';

import { CreateUserAccountDto } from '../dtos';
import { IUserAccountService } from '../interfaces';

/**
 * Service for managing user accounts.
 * Provides methods to create, update, delete, and retrieve user accounts.
 *
 * @class UserAccountService
 * @extends {BaseUserAccountService}
 * @implements {IUserAccountService}
 */
@Injectable()
export class UserAccountService
  extends BaseUserAccountService
  implements IUserAccountService
{
  public constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  /**
   * Creates a new user account.
   *
   * @param data - The data to create the user account with
   * @returns The created user account
   */
  public async createOne(data: CreateUserAccountDto): Promise<UserAccount> {
    return this.create(data);
  }
}
