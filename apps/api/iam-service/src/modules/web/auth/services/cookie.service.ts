import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Environment } from '@ecohatch/utils-api';

import { Config } from '@/enums';

import { JwtToken } from '../enums';
import { ICookieService } from '../interfaces';
import { CookieJwtToken } from '../types';

/**
 * Cookie service for handling cookie related operations
 *
 * @class CookieService
 * @implements {ICookieService}
 */
@Injectable()
export class CookieService implements ICookieService {
  public constructor(private readonly _configService: ConfigService) {}

  /**
   * Attaches JWT tokens to the cookie of the response sent to the client
   * @param {Response} res - Response object
   * @param {CookieJwtToken[]} tokens - Array of cookie JWT tokens
   * @returns {void}
   */
  public attachJwtTokens(res: Response, tokens: CookieJwtToken[]): void {
    const jwtTokenExpiry = {
      [JwtToken.ACCESS]: this._configService.get<number>(
        Config.JWT_ACCESS_EXPIRATION_TIME
      ),
      [JwtToken.REFRESH]: this._configService.get<number>(
        Config.JWT_REFRESH_EXPIRATION_TIME
      ),
    };
    const isProduction =
      this._configService.get<Environment>(Config.NODE_ENV) ===
      Environment.PROD;

    tokens.forEach((token) => {
      res.cookie(token.type, token.token, {
        expires: new Date(Date.now() + Number(jwtTokenExpiry[token.type])),
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        httpOnly: true,
      });
    });
  }

  /**
   * Clears the specified JWT tokens from the cookie of the response sent to the client
   * @param {Response} res - Response object
   * @param {JwtToken[]} tokens - Array of JWT tokens to clear
   * @returns {void}
   */
  public clearJwtTokens(res: Response, tokens: JwtToken[]): void {
    tokens.forEach((token) => {
      res.clearCookie(token);
    });
  }
}
