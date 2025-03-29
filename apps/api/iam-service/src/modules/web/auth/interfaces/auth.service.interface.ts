import { AuthTokens, TSelf } from '@ecohatch/types-shared';
import { RefreshTokenPayload } from '@ecohatch/utils-api';
import { Role } from '@ecohatch/utils-shared';

import { LoginDto } from '../dtos';

export interface IAuthService {
  loginAdmin(data: LoginDto): Promise<AuthTokens>;
  refresh(payload: RefreshTokenPayload): Promise<AuthTokens>;
  logout(userAccountId: number): Promise<void>;
  logoutAll(userAccountId: number): Promise<void>;
  logoutDevice(userAccountId: number, deviceId: number): Promise<void>;
  self(id: number, role: Role): Promise<TSelf>;
}
