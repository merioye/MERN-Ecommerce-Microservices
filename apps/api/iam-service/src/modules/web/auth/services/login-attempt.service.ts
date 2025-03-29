import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginAttempt } from '@prisma/client';

import { BaseLoginAttemptService, PrismaService } from '@/database';

import { Config } from '@/enums';

import { ILoginAttemptService } from '../interfaces';

/**
 * Login attempt service for handling user login attempt related operations
 * @class LoginAttemptService
 * @extends {BaseLoginAttemptService}
 * @implements {ILoginAttemptService}
 */
@Injectable()
export class LoginAttemptService
  extends BaseLoginAttemptService
  implements ILoginAttemptService
{
  public constructor(
    prismaService: PrismaService,
    private readonly _configService: ConfigService
  ) {
    super(prismaService);
  }

  /**
   * Check if user is locked out due to too many failed login attempts
   * @param {number} userAccountId - User Account ID
   * @param {string} ipAddress - IP address of the user
   * @returns {Promise<boolean>} True if user is locked out, false otherwise
   */
  public async isUserLockedOut(
    userAccountId: number,
    ipAddress: string
  ): Promise<boolean> {
    const LOCKOUT_DURATION = this._configService.get<number>(
      Config.LOGIN_ATTEMPT_LOCKOUT_DURATION_MILLS
    );
    const MAX_LOGIN_ATTEMPTS = this._configService.get<number>(
      Config.MAX_LOGIN_ATTEMPTS_ALLOWED
    );

    const recentAttempts = await this.findMany({
      where: {
        userAccountId,
        ipAddress,
        createdAt: {
          gte: new Date(Date.now() - LOCKOUT_DURATION!),
        },
      },
      withDeleted: false,
    });

    return recentAttempts.length >= MAX_LOGIN_ATTEMPTS!;
  }

  /**
   * Record login attempt
   * @param {number} userAccountId - User Account ID
   * @param {string} ipAddress - IP address of the user
   * @returns {Promise<LoginAttempt>} The created login attempt
   */
  public async recordLoginAttempt(
    userAccountId: number,
    ipAddress: string
  ): Promise<LoginAttempt> {
    return this.create({
      userAccount: {
        connect: {
          id: userAccountId,
        },
      },
      ipAddress,
    });
  }
}
