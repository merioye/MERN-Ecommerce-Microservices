import { Module } from '@nestjs/common';

import { AdminModule } from '../admin';
import {
  ADMIN_GROUP_PERMISSION_SERVICE,
  ADMIN_PERMISSION_SERVICE,
  PERMISSION_GROUP_SERVICE,
  PERMISSION_SERVICE,
} from './constants';
import { PermissionController } from './permission.controller';
import {
  AdminGroupPermissionService,
  AdminPermissionService,
  PermissionGroupService,
  PermissionService,
} from './services';

/**
 * This module handles permission-related functionality, including services for managing permissions,
 * permission groups, and their relationships with admin entities.
 *
 * @module PermissionModule
 */
@Module({
  imports: [AdminModule],
  controllers: [PermissionController],
  providers: [
    {
      provide: PERMISSION_SERVICE,
      useClass: PermissionService,
    },
    {
      provide: PERMISSION_GROUP_SERVICE,
      useClass: PermissionGroupService,
    },
    {
      provide: ADMIN_PERMISSION_SERVICE,
      useClass: AdminPermissionService,
    },
    {
      provide: ADMIN_GROUP_PERMISSION_SERVICE,
      useClass: AdminGroupPermissionService,
    },
  ],
})
export class PermissionModule {}
