import { AccessTokenPayload, RefreshTokenPayload } from '@ecohatch/utils-api';

export interface ITokenService {
  generateAccessToken(payload: AccessTokenPayload): string;
  generateRefreshToken(payload: RefreshTokenPayload): string;
}
