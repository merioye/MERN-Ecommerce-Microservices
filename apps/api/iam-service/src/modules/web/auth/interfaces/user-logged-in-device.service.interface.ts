import { DeviceInfo, IBasePrismaService } from '@ecohatch/utils-api';
import { Prisma, UserLoggedInDevice } from '@prisma/client';

export interface IUserLoggedInDeviceService
  extends IBasePrismaService<
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
  registerUserDevice(
    userAccountId: number,
    deviceInfo: DeviceInfo
  ): Promise<UserLoggedInDevice>;
  logoutUserDevice(
    userAccountId: number,
    deviceInfo: DeviceInfo
  ): Promise<UserLoggedInDevice[]>;
  logoutDevice(
    userAccountId: number,
    deviceId: number
  ): Promise<UserLoggedInDevice | null>;
  logoutAllDevices(userAccountId: number): Promise<UserLoggedInDevice[]>;
  getUserDevices(userAccountId: number): Promise<UserLoggedInDevice[]>;
  isDeviceLoggedOut(deviceId: number): Promise<boolean>;
}
