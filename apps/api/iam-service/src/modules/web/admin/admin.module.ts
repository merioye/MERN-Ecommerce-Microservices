import { Module } from '@nestjs/common';

import { ADMIN_GROUP_SERVICE } from './constants';
import { AdminGroupController } from './controllers';
import { AdminGroupService } from './services';

/**
 * The AdminModule is responsible for managing the admin functionalities
 * within the application. It integrates the necessary controllers and services
 * to handle admin operations.
 *
 * @module AdminModule
 */
@Module({
  controllers: [AdminGroupController],
  providers: [
    {
      provide: ADMIN_GROUP_SERVICE,
      useClass: AdminGroupService,
    },
  ],
})
export class AdminModule {}
