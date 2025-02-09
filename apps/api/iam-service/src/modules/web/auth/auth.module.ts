import { Module } from '@nestjs/common';

import { USER_ACCOUNT_SERVICE } from './constants';
import { UserAccountService } from './services';

/**
 * The AuthModule is responsible for managing the authentication functionalities
 * within the application. It integrates the necessary controllers and services
 * to handle authentication operations.
 *
 * @module AuthModule
 */
@Module({
  controllers: [],
  providers: [
    {
      provide: USER_ACCOUNT_SERVICE,
      useClass: UserAccountService,
    },
  ],
  exports: [USER_ACCOUNT_SERVICE],
})
export class AuthModule {}
