import { Injectable } from '@nestjs/common';
import { DeviceInfo } from '@ecohatch/utils-api';
import { SortDirection } from '@ecohatch/utils-shared';
import { UserLoggedInDevice } from '@prisma/client';

import { BaseUserLoggedInDeviceService, PrismaService } from '@/database';

import { IUserLoggedInDeviceService } from '../interfaces';

/**
 * Service for managing user logged in devices (sessions)
 * @class UserLoggedInDeviceService
 * @extends {BaseUserLoggedInDeviceService}
 * @implements {IUserLoggedInDeviceService}
 */
@Injectable()
export class UserLoggedInDeviceService
  extends BaseUserLoggedInDeviceService
  implements IUserLoggedInDeviceService
{
  public constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  /**
   * Register user device
   * @param {number} userAccountId - User Account ID
   * @param {string} userAgent - User agent string
   * @param {string} ipAddress - IP address
   * @param {string} platform - Platform name
   * @returns {Promise<UserLoggedInDevice>} The created user logged in device
   */
  public async registerUserDevice(
    userAccountId: number,
    deviceInfo: DeviceInfo
  ): Promise<UserLoggedInDevice> {
    // Check if device exists
    const existingDevice = await this.findOne({
      where: {
        userAccountId,
        userAgent: deviceInfo.userAgent,
        publicIp: deviceInfo.ipAddress,
        platform: deviceInfo.platform,
        loggedOutAt: null,
      },
    });
    if (existingDevice) {
      // Update last logged in timestamp
      const updatedDevice = await this.update(
        {
          id: existingDevice.id,
        },
        { lastLoggedInAt: new Date() }
      );
      return updatedDevice ?? existingDevice;
    }

    // Create new device entry
    return this.create({
      userAccount: {
        connect: {
          id: userAccountId,
        },
      },
      userAgent: deviceInfo.userAgent,
      publicIp: deviceInfo.ipAddress,
      platform: deviceInfo.platform,
    });
  }

  /**
   * Log out user device
   * @param {number} userAccountId - User Account ID
   * @param {string} userAgent - User agent string
   * @param {string} ipAddress - IP address
   * @param {string} platform - Platform name
   * @returns {Promise<UserLoggedInDevice[]>} The logged out devices
   */
  public async logoutUserDevice(
    userAccountId: number,
    deviceInfo: DeviceInfo
  ): Promise<UserLoggedInDevice[]> {
    return this.updateMany(
      {
        userAccountId,
        userAgent: deviceInfo.userAgent,
        publicIp: deviceInfo.ipAddress,
        platform: deviceInfo.platform,
        loggedOutAt: null,
      },
      {
        loggedOutAt: new Date(),
      }
    );
  }

  /**
   * Log out specific device
   * @param {number} userAccountId - User Account ID
   * @param {number} deviceId - Device ID
   * @returns {Promise<UserLoggedInDevice | null>} The logged out device
   */
  public async logoutDevice(
    userAccountId: number,
    deviceId: number
  ): Promise<UserLoggedInDevice | null> {
    return this.update(
      { id: deviceId, userAccountId },
      { loggedOutAt: new Date() }
    );
  }

  /**
   * Log out all devices for a user
   * @param {number} userAccountId - User Account ID
   * @returns {Promise<UserLoggedInDevice[]>} The logged out devices
   */
  public async logoutAllDevices(
    userAccountId: number
  ): Promise<UserLoggedInDevice[]> {
    return this.updateMany(
      {
        userAccountId,
        loggedOutAt: null,
      },
      {
        loggedOutAt: new Date(),
      }
    );
  }

  /**
   * Get user logged in devices
   * @param {number} userAccountId - User Account ID
   * @returns {Promise<UserLoggedInDevice[]>} List of user devices
   */
  public async getUserDevices(
    userAccountId: number
  ): Promise<UserLoggedInDevice[]> {
    return this.findMany({
      where: {
        userAccountId,
        loggedOutAt: null,
      },
      select: {
        id: true,
        userAgent: true,
        publicIp: true,
        platform: true,
        lastLoggedInAt: true,
      },
      orderBy: [
        {
          lastLoggedInAt: SortDirection.DESC,
        },
      ],
    });
  }

  /**
   * Check if device is logged out
   * @param {number} deviceId - Device ID
   * @returns {Promise<boolean>} True if device is logged out, false otherwise
   */
  public async isDeviceLoggedOut(deviceId: number): Promise<boolean> {
    const device = await this.findOne({
      where: {
        id: deviceId,
      },
    });

    return !device || device.loggedOutAt !== null;
  }
}
