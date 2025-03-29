import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthTokens, TSelf } from '@ecohatch/types-shared';
import {
  AuthRequestUser,
  CurrentUser,
  CustomParseIntPipe,
  ILogger,
  LOGGER,
  Public,
  RefreshTokenGuard,
  RefreshTokenPayload,
} from '@ecohatch/utils-api';
import { ApiResponse } from '@ecohatch/utils-shared';
import { UserLoggedInDevice } from '@prisma/client';

import { ENDPOINT } from '@/constants';

import {
  AUTH_SERVICE,
  COOKIE_SERVICE,
  USER_LOGGED_IN_DEVICE_SERVICE,
} from './constants';
import { LoginDto } from './dtos';
import { JwtToken } from './enums';
import {
  IAuthService,
  ICookieService,
  IUserLoggedInDeviceService,
} from './interfaces';

/**
 * Authentication controller
 * @class AuthController
 */
@Controller(ENDPOINT.Auth.Base)
@ApiTags('Auth')
export class AuthController {
  public constructor(
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService,
    @Inject(LOGGER) private readonly _logger: ILogger,
    @Inject(COOKIE_SERVICE) private readonly _cookieService: ICookieService,
    @Inject(USER_LOGGED_IN_DEVICE_SERVICE)
    private readonly _userLoggedInDeviceService: IUserLoggedInDeviceService
  ) {}

  /**
   * Login admin endpoint
   * @param {LoginDto} data - Login credentials
   * @param {Response} res - Response object
   * @returns {Promise<ApiResponse<AuthTokens>>} Access token and refresh token
   */
  @Public()
  @Post(ENDPOINT.Auth.Post.LoginAdmin)
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'User LoggedIn successfully',
  })
  @ApiBadRequestResponse({
    description: 'Request body validation failed',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @ApiForbiddenResponse({
    description: 'User account is not active',
  })
  @ApiTooManyRequestsResponse({
    description:
      'Account temporarily locked due to too many failed login attempts',
  })
  public async loginAdmin(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<ApiResponse<AuthTokens>> {
    this._logger.debug(`Login attempt for admin: `, {
      data: {
        email: data.email,
        password: '******',
      },
    });

    const tokens = await this._authService.loginAdmin(data);
    this._cookieService.attachJwtTokens(res, [
      { token: tokens.accessToken, type: JwtToken.ACCESS },
      { token: tokens.refreshToken, type: JwtToken.REFRESH },
    ]);

    this._logger.info(`Login successful for admin: `, {
      data: {
        email: data.email,
      },
    });

    return new ApiResponse({
      message: 'auth.success.User_logged_in_successfully',
      result: tokens,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Refresh token endpoint
   * @param {Response} res - Response object
   * @param {RefreshTokenPayload} payload - Refresh token data
   * @returns {Promise<ApiResponse<AuthTokens>>} New Access token and refresh token
   */
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post(ENDPOINT.Auth.Post.Refresh)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Tokens refreshed successfully',
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid refresh token | Device is logged out | User not found',
  })
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() payload: RefreshTokenPayload
  ): Promise<ApiResponse<AuthTokens>> {
    const loggerMetadata = {
      userId: payload.sub,
      userAccountId: payload.userAccountId,
      email: payload.email,
      deviceId: payload.deviceId,
      jwtId: payload.jwtid,
    };
    this._logger.debug('Token refresh request', {
      data: loggerMetadata,
    });

    const tokens = await this._authService.refresh(payload);
    this._cookieService.attachJwtTokens(res, [
      { token: tokens.accessToken, type: JwtToken.ACCESS },
      { token: tokens.refreshToken, type: JwtToken.REFRESH },
    ]);

    this._logger.info('Token refresh successful', {
      data: loggerMetadata,
    });

    return new ApiResponse({
      message: 'auth.success.Tokens_refreshed_successfully',
      result: tokens,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Logout endpoint
   * @param {Response} res - Response object
   * @param {AuthRequestUser} user - Currently logged in user
   * @returns {Promise<ApiResponse<null>>}
   */
  @Post(ENDPOINT.Auth.Post.Logout)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOkResponse({
    description: 'User logged out successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: AuthRequestUser
  ): Promise<ApiResponse<null>> {
    const loggerMetadata = {
      userId: user.userId,
      userAccountId: user.userAccountId,
      email: user.email,
      deviceId: user.deviceId,
    };
    this._logger.debug('Logout request', {
      data: loggerMetadata,
    });

    await this._authService.logout(user.userAccountId as unknown as number);
    this._cookieService.clearJwtTokens(res, [
      JwtToken.ACCESS,
      JwtToken.REFRESH,
    ]);

    this._logger.info('Logout successful', {
      data: loggerMetadata,
    });

    return new ApiResponse({
      message: 'auth.success.User_logged_out_successfully',
      result: null,
      statusCode: HttpStatus.NO_CONTENT,
    });
  }

  /**
   * Logout all devices endpoint
   * @param {Response} res - Response object
   * @param {AuthRequestUser} user - Currently logged in user
   * @returns {Promise<ApiResponse<null>>}
   */
  @Post(ENDPOINT.Auth.Post.LogoutAll)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOkResponse({
    description: 'User logged out from all devices successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  async logoutAll(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: AuthRequestUser
  ): Promise<ApiResponse<null>> {
    const loggerMetadata = {
      userId: user.userId,
      userAccountId: user.userAccountId,
      email: user.email,
      requestingUserDeviceId: user.deviceId,
    };
    this._logger.debug('Logout all devices request', {
      data: loggerMetadata,
    });

    await this._authService.logoutAll(user.userAccountId as unknown as number);
    this._cookieService.clearJwtTokens(res, [
      JwtToken.ACCESS,
      JwtToken.REFRESH,
    ]);

    this._logger.info('Logout all devices successful', {
      data: loggerMetadata,
    });

    return new ApiResponse({
      message: 'auth.success.User_logged_out_from_all_devices_successfully',
      result: null,
      statusCode: HttpStatus.NO_CONTENT,
    });
  }

  /**
   * Logout specific device endpoint
   * @param {Response} res - Response object
   * @param {number} deviceIdToLogout - Device ID to logout
   * @param {AuthRequestUser} user - Currently logged in user
   * @returns {Promise<void>}
   */
  @Post(ENDPOINT.Auth.Post.LogoutDevice)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOkResponse({
    description: 'User logged out from device successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid deviceId',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  async logoutDevice(
    @Res({ passthrough: true }) res: Response,
    @Param('deviceId', CustomParseIntPipe) deviceIdToLogout: number,
    @CurrentUser() user: AuthRequestUser
  ): Promise<ApiResponse<null>> {
    const loggerMetadata = {
      userId: user.userId,
      userAccountId: user.userAccountId,
      email: user.email,
      requestingUserDeviceId: user.deviceId,
      deviceIdToLogout,
    };
    this._logger.debug('Logout specific device request', {
      data: loggerMetadata,
    });

    await this._authService.logoutDevice(
      user.userAccountId as unknown as number,
      deviceIdToLogout
    );

    if (deviceIdToLogout == user.deviceId) {
      this._cookieService.clearJwtTokens(res, [
        JwtToken.ACCESS,
        JwtToken.REFRESH,
      ]);
    }

    this._logger.info('Logout specific device successful', {
      data: loggerMetadata,
    });

    return new ApiResponse({
      message: 'auth.success.User_logged_out_from_device_successfully',
      result: null,
      statusCode: HttpStatus.NO_CONTENT,
    });
  }

  /**
   * Get current user info endpoint
   * @param {AuthRequestUser} user - Currently logged in user
   * @returns {Promise<ApiResponse<TSelf>>} User info
   */
  @Get(ENDPOINT.Auth.Get.Self)
  @ApiOkResponse({
    description: 'Data fetched successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  @ApiForbiddenResponse({
    description: 'User account is not active',
  })
  async getSelf(
    @CurrentUser() user: AuthRequestUser
  ): Promise<ApiResponse<TSelf>> {
    this._logger.debug('Get self info request', {
      query: {
        userId: user.userId,
        userAccountId: user.userAccountId,
        email: user.email,
        deviceId: user.deviceId,
      },
    });

    const data = await this._authService.self(user.userId, user.role);

    return new ApiResponse({
      message: 'auth.success.Data_fetched_successfully',
      result: data,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Get user logged in devices endpoint
   * @param {AuthRequestUser} user - Currently logged in user
   * @returns {Promise<ApiResponse<UserLoggedInDevice[]>>} List of user logged in devices
   */
  @Get(ENDPOINT.Auth.Get.LoggedInDevices)
  @ApiOkResponse({
    description: 'Data fetched successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  async getLoggedInDevices(
    @CurrentUser() user: AuthRequestUser
  ): Promise<ApiResponse<UserLoggedInDevice[]>> {
    this._logger.debug('Get logged in devices request', {
      query: {
        userId: user.userId,
        userAccountId: user.userAccountId,
        email: user.email,
        deviceId: user.deviceId,
      },
    });

    const data = await this._userLoggedInDeviceService.getUserDevices(
      user.userAccountId as unknown as number
    );

    return new ApiResponse({
      message: 'auth.success.Data_fetched_successfully',
      result: data,
      statusCode: HttpStatus.OK,
    });
  }
}
