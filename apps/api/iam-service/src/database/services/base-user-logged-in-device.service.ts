import { Injectable } from '@nestjs/common';
import { BasePrismaService } from '@ecohatch/utils-api';
import { Prisma, UserLoggedInDevice } from '@prisma/client';

import { PrismaService } from '../prisma.service';

/**
 * The BaseUserLoggedInDeviceService class provides methods for managing user logged in devices.
 * It extends the BasePrismaService class and provides methods for interacting
 * with the database for user logged in device entity.
 *
 * @class BaseUserLoggedInDeviceService
 * @extends {BasePrismaService}
 */
@Injectable()
export class BaseUserLoggedInDeviceService extends BasePrismaService<
  UserLoggedInDevice,
  'userLoggedInDevice',
  Prisma.UserLoggedInDeviceCreateInput,
  Prisma.UserLoggedInDeviceUpdateInput,
  Prisma.UserLoggedInDeviceWhereInput,
  Prisma.UserLoggedInDeviceSelect,
  Prisma.UserLoggedInDeviceInclude,
  Prisma.UserLoggedInDeviceOrderByWithRelationInput[],
  any,
  Prisma.UserLoggedInDeviceScalarFieldEnum
> {
  public constructor(prismaService: PrismaService) {
    super(prismaService, 'userLoggedInDevice');
  }
}
