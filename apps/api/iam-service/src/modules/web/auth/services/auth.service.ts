import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AuthTokens, TSelf } from '@ecohatch/types-shared';
import {
  AccessTokenPayload,
  DeviceInfo,
  EntityPrimaryKey,
  ForbiddenError,
  HASH_SERVICE,
  HTTP_HELPER_SERVICE,
  IHashService,
  IHttpHelperService,
  NotAuthorizedError,
  RefreshTokenPayload,
  TooManyRequestsError,
} from '@ecohatch/utils-api';
import { Role } from '@ecohatch/utils-shared';
import { UserAccount } from '@prisma/client';

import { ADMIN_SERVICE, IAdminService } from '../../admin';
import { ADMIN_PERMISSION_SERVICE } from '../../permission/constants';
import { IAdminPermissionService } from '../../permission/interfaces';
import {
  LOGIN_ATTEMPT_SERVICE,
  REFRESH_TOKEN_SERVICE,
  TOKEN_SERVICE,
  USER_ACCOUNT_SERVICE,
  USER_LOGGED_IN_DEVICE_SERVICE,
} from '../constants';
import { LoginDto } from '../dtos';
import {
  IAuthService,
  ILoginAttemptService,
  IRefreshTokenService,
  ITokenService,
  IUserAccountService,
  IUserLoggedInDeviceService,
} from '../interfaces';

/**
 * AuthService is a service that handles authentication operations.
 * It provides methods for logging in, refreshing tokens, and logging out.
 *
 * @class AuthService
 * @implements {IAuthService}
 */
@Injectable()
export class AuthService implements IAuthService {
  public constructor(
    @Inject(HTTP_HELPER_SERVICE)
    private readonly _httpHelperService: IHttpHelperService,
    @Inject(forwardRef(() => ADMIN_SERVICE))
    private readonly _adminService: IAdminService,
    @Inject(USER_ACCOUNT_SERVICE)
    private readonly _userAccountService: IUserAccountService,
    @Inject(HASH_SERVICE) private readonly _hashService: IHashService,
    @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenService,
    @Inject(REFRESH_TOKEN_SERVICE)
    private readonly _refreshTokenService: IRefreshTokenService,
    @Inject(LOGIN_ATTEMPT_SERVICE)
    private readonly _loginAttemptService: ILoginAttemptService,
    @Inject(USER_LOGGED_IN_DEVICE_SERVICE)
    private readonly _userLoggedInDeviceService: IUserLoggedInDeviceService,
    @Inject(ADMIN_PERMISSION_SERVICE)
    private readonly _adminPermissionService: IAdminPermissionService
  ) {}

  /**
   * Logins the admin
   * @param {LoginDto} data - Login credentials
   * @returns {Promise<AuthTokens>} Access token and refresh token
   */
  public async loginAdmin(data: LoginDto): Promise<AuthTokens> {
    const { email } = data;

    // Find admin by email
    const [admin, userAccount] = await Promise.all([
      this._adminService.findOne({ where: { email } }),
      this._userAccountService.findOne({ where: { email } }),
    ]);
    if (!admin || !userAccount) {
      throw new NotAuthorizedError('auth.error.Invalid_credentials');
    }
    if (!admin.isActive) {
      throw new ForbiddenError('auth.error.User_account_is_not_active');
    }

    // Get permissions of the admin
    const permissions = await this._adminPermissionService.findAll(
      admin.id as unknown as EntityPrimaryKey
    );
    const permissionSlugs = permissions?.map((permission) => permission.slug);

    return this.processUserLogin({
      loginCredentials: data,
      userActualPasswordHash: admin.password,
      permissions: permissionSlugs,
      userAccount,
    });
  }

  /**
   * Refreshes the authentication tokens using refresh token
   * @param {RefreshTokenPayload} payload - Refresh token payload
   * @returns {Promise<AuthTokens>} New access token and refresh token
   */
  public async refresh(payload: RefreshTokenPayload): Promise<AuthTokens> {
    // Check user account exists
    const userAccount = await this._userAccountService.findOne({
      where: { id: payload.userAccountId },
    });
    if (!userAccount) {
      throw new NotAuthorizedError('auth.error.User_not_found');
    }

    // Get client device info
    const deviceInfo = this._httpHelperService.getClientDeviceInfo();

    // Delete old refresh token from database
    await this._refreshTokenService.delete({ id: Number(payload.jwtid) });

    return this.generateJwtTokens({
      userAccount,
      permissions: payload.permissions,
      deviceInfo,
    });
  }

  /**
   * Logs out the user from the current device
   * @param {number} userAccountId - User Account ID
   * @returns {Promise<void>}
   */
  public async logout(userAccountId: number): Promise<void> {
    // Get client device info
    const deviceInfo = this._httpHelperService.getClientDeviceInfo();

    const loggedOutDevices =
      await this._userLoggedInDeviceService.logoutUserDevice(
        userAccountId,
        deviceInfo
      );
    const deviceIds = loggedOutDevices.map((device) => device.id);

    // Delete refresh tokens for logged out devices
    await this._refreshTokenService.deleteMany({
      userLoggedInDeviceId: { in: deviceIds },
    });
  }

  /**
   * Logs out the user from all logged in devices
   * @param {number} userAccountId - User Account ID
   * @returns {Promise<void>}
   */
  public async logoutAll(userAccountId: number): Promise<void> {
    const loggedOutDevices =
      await this._userLoggedInDeviceService.logoutAllDevices(userAccountId);
    const deviceIds = loggedOutDevices.map((device) => device.id);

    // Delete refresh tokens for logged out devices
    await this._refreshTokenService.deleteMany({
      userLoggedInDeviceId: { in: deviceIds },
    });
  }

  /**
   * Logs out the user from a specific device
   * @param {number} userAccountId - User Account ID
   * @param {number} deviceId - Device ID
   * @returns {Promise<void>}
   */
  public async logoutDevice(
    userAccountId: number,
    deviceId: number
  ): Promise<void> {
    const loggedOutDevice = await this._userLoggedInDeviceService.logoutDevice(
      userAccountId,
      deviceId
    );

    // Delete refresh tokens for logged out device
    await this._refreshTokenService.deleteMany({
      userLoggedInDeviceId: loggedOutDevice?.id,
    });
  }

  /**
   * Retrieves the user details
   * @param {number} id - User ID
   * @param {Role} role - User role
   * @returns {Promise<TSelf>} User details
   */
  public async self(id: number, role: Role): Promise<TSelf> {
    let user: TSelf;

    if (role === Role.ADMIN || role === Role.ADMIN_USER) {
      const admin = await this._adminService.findOne({ where: { id } });
      const permissions = await this._adminPermissionService.findAll(
        id as unknown as EntityPrimaryKey
      );
      delete (admin as { password?: string })?.password;

      user = admin
        ? {
            ...admin,
            permissions,
          }
        : null;
    } else {
      user = null;
    }

    if (user && !user.isActive) {
      throw new ForbiddenError('auth.error.User_account_is_not_active');
    }

    return user;
  }

  /**
   * Processes the user login flow for user account
   * @param {LoginDto} loginCredentials - Login credentials
   * @param {string} userActualPasswordHash - User actual password hash
   * @param {UserAccount} userAccount - User account
   * @param {string[]} permissions - User permissions
   * @returns {Promise<AuthTokens>} Access token and refresh token
   */
  private async processUserLogin({
    loginCredentials,
    userActualPasswordHash,
    userAccount,
    permissions,
  }: {
    loginCredentials: LoginDto;
    userActualPasswordHash: string;
    userAccount: UserAccount;
    permissions: string[];
  }): Promise<AuthTokens> {
    const { password } = loginCredentials;

    // Get client device info
    const deviceInfo = this._httpHelperService.getClientDeviceInfo();

    // Check if user is locked out
    const isLockedOut = await this._loginAttemptService.isUserLockedOut(
      userAccount.id,
      deviceInfo.ipAddress
    );
    if (isLockedOut) {
      throw new TooManyRequestsError(
        'auth.error.Account_temporarily_locked_due_to_too_many_failed_login_attempts'
      );
    }

    // Verify password
    const isPasswordValid = await this._hashService.compare(
      password,
      userActualPasswordHash
    );

    // Record login attempt
    await this._loginAttemptService.recordLoginAttempt(
      userAccount.id,
      deviceInfo.ipAddress
    );

    if (!isPasswordValid) {
      throw new NotAuthorizedError('auth.error.Invalid_credentials');
    }

    return this.generateJwtTokens({
      userAccount,
      permissions,
      deviceInfo,
    });
  }

  /**
   * Generates JWT tokens for user account
   * @param {UserAccount} userAccount - User account
   * @param {string[]} permissions - User permissions
   * @param {DeviceInfo} deviceInfo - Client device info
   * @returns {Promise<AuthTokens>} Access token and refresh token
   */
  private async generateJwtTokens({
    userAccount,
    permissions,
    deviceInfo,
  }: {
    userAccount: UserAccount;
    permissions: string[];
    deviceInfo: DeviceInfo;
  }): Promise<AuthTokens> {
    // Register user device
    const device = await this._userLoggedInDeviceService.registerUserDevice(
      userAccount.id,
      deviceInfo
    );

    // Persist refresh token in database
    const persistedRefreshToken = await this._refreshTokenService.persist(
      userAccount.id,
      device.id
    );

    // Generate JWT tokens
    const tokenPayload: AccessTokenPayload = {
      deviceId: device.id?.toString(),
      sub: userAccount.userReferenceId?.toString(),
      email: userAccount.email,
      firstName: userAccount.firstName,
      lastName: userAccount.lastName,
      userAccountId: userAccount.id,
      role: userAccount.userType as Role,
      permissions,
    };
    const accessToken = this._tokenService.generateAccessToken(tokenPayload);
    const refreshToken = this._tokenService.generateRefreshToken({
      ...tokenPayload,
      jwtid: persistedRefreshToken.id?.toString(),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
