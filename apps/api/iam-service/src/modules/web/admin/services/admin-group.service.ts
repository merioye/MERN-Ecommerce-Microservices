import { Injectable } from '@nestjs/common';
import { BadRequestError, NotFoundError } from '@ecohatch/utils-api';
import { AdminGroup } from '@prisma/client';

import { PrismaService } from '@/database';

import { CreateAdminGroupDto, UpdateAdminGroupDto } from '../dtos';
import { IAdminGroupService } from '../interfaces';

/**
 * Service for managing admin groups.
 * Provides methods to create, update, delete, and retrieve admin groups.
 *
 * @class AdminGroupService
 * @implements {IAdminGroupService}
 */
@Injectable()
export class AdminGroupService implements IAdminGroupService {
  public constructor(private readonly _prismaService: PrismaService) {}

  /**
   * Creates a new admin group.
   * @param {CreateAdminGroupDto} data - The data containing the details of the admin group to create.
   * @returns {Promise<AdminGroup>} - The created admin group.
   */
  public async create(data: CreateAdminGroupDto): Promise<AdminGroup> {
    const isExistingGroup = await this._prismaService.adminGroup.findFirst({
      where: { slug: data.slug },
    });
    if (isExistingGroup) {
      throw new BadRequestError('adminGroup.error.AdminGroup_already_exists');
    }

    return this._prismaService.adminGroup.create({
      data,
    });
  }

  /**
   * Updates an admin group.
   * @param {UpdateAdminGroupDto} data - The data containing the details of the admin group to update.
   * @param {number} id - The ID of the admin group to update.
   * @returns {Promise<AdminGroup>} - The updated admin group.
   */
  public async updateOne(
    id: number,
    data: UpdateAdminGroupDto
  ): Promise<AdminGroup> {
    const isExistingGroup = await this._prismaService.adminGroup.findUnique({
      where: { id },
    });
    if (!isExistingGroup) {
      throw new NotFoundError('adminGroup.error.AdminGroup_not_found');
    }

    if (data.slug && data.slug !== isExistingGroup.slug) {
      const isExistingGroup = await this._prismaService.adminGroup.findFirst({
        where: { slug: data.slug },
      });
      if (isExistingGroup) {
        throw new BadRequestError(
          'adminGroup.error.AdminGroup_slug_already_exists'
        );
      }
    }

    return this._prismaService.adminGroup.update({
      where: { id },
      data,
    });
  }
}
