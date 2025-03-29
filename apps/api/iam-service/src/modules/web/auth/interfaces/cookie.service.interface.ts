import { Response } from 'express';

import { JwtToken } from '../enums';
import { CookieJwtToken } from '../types';

export interface ICookieService {
  attachJwtTokens(res: Response, tokens: CookieJwtToken[]): void;
  clearJwtTokens(res: Response, tokens: JwtToken[]): void;
}
