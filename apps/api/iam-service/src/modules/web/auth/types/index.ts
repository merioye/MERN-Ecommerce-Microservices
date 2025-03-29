import { JwtToken } from '../enums';

export type CookieJwtToken = {
  token: string;
  type: JwtToken;
};
