import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from '@prisma/client';

import { BaseRefreshTokenService, PrismaService } from '@/database';

import { Config } from '@/enums';

import { IRefreshTokenService } from '../interfaces';

/**
 * Refresh token service for handling refresh token related operations
 * @class RefreshTokenService
 * @extends {BaseRefreshTokenService}
 * @implements {IRefreshTokenService}
 */
@Injectable()
export class RefreshTokenService
  extends BaseRefreshTokenService
  implements IRefreshTokenService
{
  public constructor(
    prismaService: PrismaService,
    private readonly _configService: ConfigService
  ) {
    super(prismaService);
  }

  /**
   * Saves a new refresh token in the database for the specified user account and device
   * @param {number} userAccountId - The ID of the user account
   * @param {number} deviceId - The ID of the device
   * @returns {Promise<RefreshToken>} The created refresh token
   */
  public async persist(
    userAccountId: number,
    deviceId: number
  ): Promise<RefreshToken> {
    const refreshTokenExpiresAt = new Date(
      Date.now() +
        this._configService.get<number>(Config.JWT_REFRESH_EXPIRATION_TIME)!
    );

    return this.create({
      userLoggedInDevice: {
        connect: {
          id: deviceId,
        },
      },
      userAccount: {
        connect: {
          id: userAccountId,
        },
      },
      expiresAt: refreshTokenExpiresAt,
    });
  }
}
