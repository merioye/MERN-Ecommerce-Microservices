import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth';
import { ADMIN_GROUP_SERVICE, ADMIN_SERVICE } from './constants';
import { AdminController, AdminGroupController } from './controllers';
import { AdminGroupService, AdminService } from './services';

/**
 * The AdminModule is responsible for managing the admin functionalities
 * within the application. It integrates the necessary controllers and services
 * to handle admin operations.
 *
 * @module AdminModule
 */
@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [AdminGroupController, AdminController],
  providers: [
    {
      provide: ADMIN_GROUP_SERVICE,
      useClass: AdminGroupService,
    },
    {
      provide: ADMIN_SERVICE,
      useClass: AdminService,
    },
  ],
  exports: [ADMIN_GROUP_SERVICE, ADMIN_SERVICE],
})
export class AdminModule {}
