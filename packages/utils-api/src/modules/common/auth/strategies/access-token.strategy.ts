import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { AuthTokens } from '@ecohatch/types-shared';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Pool, PoolClient } from 'pg';

import { NotAuthorizedError } from '../../../../common/errors';
import { EntityPrimaryKey } from '../../../../database';
import { ILogger, LOGGER } from '../../logger';
import { ACCESS_TOKEN_STRATEGY, AUTH_MODULE_OPTIONS } from '../constants';
import {
  AccessTokenPayload,
  AuthRequestUser,
  BaseAuthModuleOptions,
} from '../types';

/**
 * Passport strategy for validating access tokens
 * @class AccessTokenStrategy
 * @implements {OnModuleInit, OnModuleDestroy}
 */
@Injectable()
export class AccessTokenStrategy
  extends PassportStrategy(Strategy, ACCESS_TOKEN_STRATEGY)
  implements OnModuleInit, OnModuleDestroy
{
  private readonly _pool: Pool;

  public constructor(
    @Inject(AUTH_MODULE_OPTIONS)
    {
      authDbUrl,
      jwksUrl,
      jwksRequestsPerMinute,
      jwtAudience,
      jwtIssuer,
    }: BaseAuthModuleOptions,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          try {
            return this.extractAccessToken(req);
          } catch (error) {
            this._logger.error(
              'Error extracting access token from request',
              error
            );
            return null;
          }
        },
      ]),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: jwksRequestsPerMinute ?? 5,
        jwksUri: jwksUrl,
        handleSigningKeyError(err) {
          _logger.error('JWKS signing key error', err);
        },
      }),
      algorithms: ['RS256'],
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
   * Validates access token payload
   * @param {AccessTokenPayload} payload - The decoded access token payload
   * @returns {Promise<AuthRequestUser>} Validated user data
   */
  public async validate(payload: AccessTokenPayload): Promise<AuthRequestUser> {
    const {
      email,
      userAccountId,
      sub,
      deviceId: deviceIdStr,
      ...rest
    } = payload;
    const userId = Number(sub);
    const deviceId = Number(deviceIdStr);

    let client: PoolClient | undefined;
    try {
      client = await this._pool.connect();

      const query = `
        SELECT
          ua.id AS user_account_id,
          d.id AS device_id,
          rt.id AS refresh_token_id
        FROM tbl_user_accounts ua
        LEFT JOIN tbl_user_logged_in_devices d ON ua.id = d.user_account_id AND d.id = $2 AND d.logged_out_at IS NULL
        LEFT JOIN tbl_refresh_tokens rt ON ua.id = rt.user_account_id AND rt.user_logged_in_device_id = d.id AND rt.is_revoked = false
        WHERE ua.email = $1
      `;

      const { rows } = await client.query(query, [email, deviceId]);

      // Check if user exists
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!rows[0]?.user_account_id) {
        throw new NotAuthorizedError('auth.error.User_not_found');
      }
      // Check if device is still logged in
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!rows[0]?.device_id) {
        throw new NotAuthorizedError('auth.error.Device_is_logged_out');
      }
      // Check if refresh token is still valid
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!rows[0]?.refresh_token_id) {
        throw new NotAuthorizedError('auth.error.Refresh_token_is_revoked');
      }

      // Return user data
      return {
        userId,
        email,
        userAccountId: userAccountId as unknown as EntityPrimaryKey,
        deviceId: deviceId,
        ...rest,
      };
    } catch (error) {
      if (error instanceof NotAuthorizedError) {
        throw error;
      }
      // Log the actual error for debugging
      this._logger.error(`Access token authentication error: `, error);
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
      const token = this.extractAccessToken(req);
      if (!token) {
        return this.fail('auth.error.No_access_token_found', 401);
      }

      return super.authenticate(req, {
        failureMessage: 'auth.error.Access_token_verification_failed',
      });
    } catch (error) {
      this._logger.error('Error in access token authenticate method', error);
      return this.error(error as Error);
    }
  }

  /**
   * Handles the request
   * @param {Error} err - Error object
   * @param {AuthRequestUser | null } user - User object
   * @param {any} info - Additional info
   * @returns {AuthRequestUser} Processed user object
   */
  public handleRequest(
    err: Error,
    user: AuthRequestUser | null,
    info: any
  ): AuthRequestUser {
    if (err || !user) {
      this._logger.error(`Access token authentication error: `, err || info);
      throw new NotAuthorizedError(
        'auth.error.Access_token_expired_or_invalid'
      );
    }
    return user;
  }

  /**
   * Extracts access token from request
   * @private
   * @param {Request} req - Request object
   * @returns {string | null} Extracted token or null
   */
  private extractAccessToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader?.split(' ')[1] !== 'undefined') {
      const token = authHeader?.split(' ')[1];
      if (token) {
        return token;
      }
    }

    const { accessToken } = req.cookies as Partial<AuthTokens>;
    return accessToken || null;
  }
}
