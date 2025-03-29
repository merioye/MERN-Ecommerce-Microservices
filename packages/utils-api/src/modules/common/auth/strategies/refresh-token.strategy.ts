import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { AuthTokens } from '@ecohatch/types-shared';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Pool, PoolClient } from 'pg';

import { NotAuthorizedError } from '../../../../common/errors';
import { ILogger, LOGGER } from '../../logger';
import { AUTH_MODULE_OPTIONS, REFRESH_TOKEN_STRATEGY } from '../constants';
import { BaseAuthModuleOptions, RefreshTokenPayload } from '../types';

/**
 * Passport strategy for validating refresh tokens
 * @class RefreshTokenStrategy
 * @implements {OnModuleInit, OnModuleDestroy}
 */
@Injectable()
export class RefreshTokenStrategy
  extends PassportStrategy(Strategy, REFRESH_TOKEN_STRATEGY)
  implements OnModuleInit, OnModuleDestroy
{
  private readonly _pool: Pool;

  public constructor(
    @Inject(AUTH_MODULE_OPTIONS)
    {
      refreshTokenSecret,
      jwtAudience,
      jwtIssuer,
      authDbUrl,
    }: BaseAuthModuleOptions,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          const { refreshToken } = req.cookies as Partial<AuthTokens>;
          return refreshToken ?? null;
        },
      ]),
      secretOrKey: refreshTokenSecret,
      algorithms: ['HS256'],
      ignoreExpiration: false,
      audience: jwtAudience,
      issuer: jwtIssuer,
      passReqToCallback: false, // Set to true if you need request in validate
    });
    this._pool = new Pool({ connectionString: authDbUrl });
  }

  /**
   * Connect to the database pool when the module is initialized
   * @returns {Promise<void>}
   */
  public async onModuleInit(): Promise<void> {
    await this._pool.connect();
  }

  /**
   * Close the pool when the module is destroyed
   * @returns {Promise<void>}
   */
  public async onModuleDestroy(): Promise<void> {
    await this._pool.end();
  }

  /**
   * Validates the refresh token payload.
   * @param payload - The decoded refresh token payload.
   * @returns {Promise<RefreshTokenPayload>} Validated refresh token data
   */
  public async validate(
    payload: RefreshTokenPayload
  ): Promise<RefreshTokenPayload> {
    const { userAccountId, jwtid } = payload;
    const refreshTokenId = Number(jwtid);

    let client: PoolClient | undefined;
    try {
      client = await this._pool.connect();

      const query = `
        SELECT
          rt.id AS refresh_token_id,
          d.id AS device_id
        FROM tbl_refresh_tokens rt
        LEFT JOIN tbl_user_logged_in_devices d
          ON rt.user_logged_in_device_id = d.id
          AND d.user_account_id = $1
          AND d.logged_out_at IS NULL
        WHERE rt.id = $2
          AND rt.is_revoked = false
          AND rt.expires_at > NOW();
      `;
      const { rows } = await client.query(query, [
        userAccountId,
        refreshTokenId,
      ]);

      // Check if token exists in the database and is not revoked
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!rows[0]?.refresh_token_id) {
        throw new NotAuthorizedError('auth.error.Invalid_refresh_token');
      }
      // If the device is logged out, revoke the refresh token
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!rows[0]?.device_id) {
        await client.query(
          `UPDATE tbl_refresh_tokens SET is_revoked = true WHERE id = $1`,
          [refreshTokenId]
        );
        throw new NotAuthorizedError('auth.error.Device_is_logged_out');
      }

      return payload;
    } catch (error) {
      if (error instanceof NotAuthorizedError) {
        throw error;
      }
      // Log the actual error for debugging
      this._logger.error(`Refresh token authentication error: `, error);
      // Then throw a generic error to the client
      throw new NotAuthorizedError('auth.error.User_is_not_authenticated');
    } finally {
      client?.release();
    }
  }

  /**
   * Authenticates the request
   * @param {Request} req - Request object
   * @returns {void}
   */
  public authenticate(req: Request): void {
    try {
      // Check if token exists before trying to authenticate
      const { refreshToken } = req.cookies as Partial<AuthTokens>;
      if (!refreshToken) {
        return this.fail('auth.error.No_refresh_token_found', 401);
      }

      return super.authenticate(req, {
        failureMessage: 'auth.error.Refresh_token_verification_failed',
      });
    } catch (error) {
      this._logger.error('Error in refresh token authenticate method', error);
      return this.error(error as Error);
    }
  }

  /**
   * Handles the request
   * @param {Error} err - Error object
   * @param {RefreshTokenPayload | null } payload - Refresh token payload
   * @param {any} info - Additional info
   * @returns {RefreshTokenPayload} Processed refresh token payload object
   */
  public handleRequest(
    err: Error,
    payload: RefreshTokenPayload | null,
    info: any
  ): RefreshTokenPayload {
    if (err || !payload) {
      this._logger.error(`Refresh token authentication error: `, err || info);
      throw new NotAuthorizedError(
        'auth.error.Refresh_token_expired_or_invalid'
      );
    }
    return payload;
  }
}
