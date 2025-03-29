import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ACCESS_TOKEN_STRATEGY } from '@ecohatch/utils-api';

import { AdminModule } from '../admin';
import { PermissionModule } from '../permission';
import { AuthController } from './auth.controller';
import {
  AUTH_SERVICE,
  COOKIE_SERVICE,
  LOGIN_ATTEMPT_SERVICE,
  REFRESH_TOKEN_SERVICE,
  TOKEN_SERVICE,
  USER_ACCOUNT_SERVICE,
  USER_LOGGED_IN_DEVICE_SERVICE,
} from './constants';
import {
  AuthService,
  CookieService,
  LoginAttemptService,
  RefreshTokenService,
  TokenService,
  UserAccountService,
  UserLoggedInDeviceService,
} from './services';

/**
 * The AuthModule is responsible for managing the authentication functionalities
 * within the application. It integrates the necessary controllers and services
 * to handle authentication operations.
 *
 * @module AuthModule
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: ACCESS_TOKEN_STRATEGY }),
    JwtModule.register({}),
    forwardRef(() => AdminModule),
    PermissionModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: USER_ACCOUNT_SERVICE,
      useClass: UserAccountService,
    },
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
    {
      provide: LOGIN_ATTEMPT_SERVICE,
      useClass: LoginAttemptService,
    },
    {
      provide: REFRESH_TOKEN_SERVICE,
      useClass: RefreshTokenService,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: TokenService,
    },
    {
      provide: USER_LOGGED_IN_DEVICE_SERVICE,
      useClass: UserLoggedInDeviceService,
    },
    {
      provide: COOKIE_SERVICE,
      useClass: CookieService,
    },
  ],
  exports: [USER_ACCOUNT_SERVICE],
})
export class AuthModule {}
