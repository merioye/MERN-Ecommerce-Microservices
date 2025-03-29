import { Request } from 'express';
import { Action, Resource, Role } from '@ecohatch/utils-shared';

import { EntityPrimaryKey } from '../../../../database';

export type RequiredPermission = {
  action: Action;
  resource: Resource;
};

/**
 * Type for authenticated user object
 * @typedef AuthRequestUser
 */
export type AuthRequestUser = {
  userId: number;
  userAccountId: EntityPrimaryKey;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  deviceId: number;
  permissions: string[];
};

/**
 * Type for access token payload
 * @typedef AccessTokenPayload
 */
export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  userAccountId: number;
  deviceId: string;
  permissions: string[];
  iat?: number;
  exp?: number;
};

/**
 * Type for refresh token payload
 * @typedef RefreshTokenPayload
 */
export type RefreshTokenPayload = AccessTokenPayload & {
  jwtid: string;
};

/**
 * Custom request type that includes the custom added properties
 * @typedef CustomRequest
 */
export type CustomRequest = Request & {
  user: AuthRequestUser;
  correlationId: string;
};

/**
 * Base options for the auth module
 * @typedef BaseAuthModuleOptions
 */
export type BaseAuthModuleOptions = {
  authDbUrl: string;
  jwtAudience: string;
  jwtIssuer: string;
  jwksUrl: string;
  refreshTokenSecret?: string;
  jwksRequestsPerMinute?: number;
};
