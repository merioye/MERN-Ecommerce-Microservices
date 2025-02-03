import { Injectable } from '@nestjs/common';
import { OffsetPaginatedResult } from '@ecohatch/types-shared';
import { BadRequestError, NotFoundError } from '@ecohatch/utils-api';
import { AdminGroup, Prisma } from '@prisma/client';

import { BaseAdminGroupService, PrismaService } from '@/database';

import {
  CreateAdminGroupDto,
  GetAdminGroupListDto,
  UpdateAdminGroupDto,
} from '../dtos';
import { IAdminGroupService } from '../interfaces';

/**
 * Service for managing admin groups.
 * Provides methods to create, update, delete, and retrieve admin groups.
 *
 * @class AdminGroupService
 * @extends {BaseAdminGroupService}
 * @implements {IAdminGroupService}
 */
@Injectable()
export class AdminGroupService
  extends BaseAdminGroupService
  implements IAdminGroupService
{
  public constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  /**
   * Creates a new admin group.
   * @param {CreateAdminGroupDto} data - The data containing the details of the admin group to create.
   * @returns {Promise<AdminGroup>} - The created admin group.
   */
  public async createOne(data: CreateAdminGroupDto): Promise<AdminGroup> {
    const isExistingGroup = await this.findOne({
      where: { slug: data.slug },
      withDeleted: true,
    });
    if (isExistingGroup) {
      throw new BadRequestError('adminGroup.error.AdminGroup_already_exists');
    }

    return this.create(data);
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
    const isExistingGroup = await this.findById(id);
    if (!isExistingGroup) {
      throw new NotFoundError('adminGroup.error.AdminGroup_not_found');
    }

    if (data.slug && data.slug !== isExistingGroup.slug) {
      const isExistingGroup = await this.findOne({
        where: { slug: data.slug },
        withDeleted: true,
      });
      if (isExistingGroup) {
        throw new BadRequestError(
          'adminGroup.error.AdminGroup_slug_already_exists'
        );
      }
    }

    return this.update({ id }, data);
  }

  /**
   * Soft deletes an admin group.
   * @param {number} id - The ID of the admin group to delete.
   * @returns {Promise<AdminGroup>} - The deleted admin group.
   */
  public async softDeleteOne(id: number): Promise<AdminGroup> {
    const adminGroup = await this.findById(id);
    if (!adminGroup) {
      throw new NotFoundError('adminGroup.error.AdminGroup_not_found');
    }

    return this.softDelete({ id });
  }

  /**
   * Hard deletes an admin group.
   * @param {number} id - The ID of the admin group to delete.
   * @returns {Promise<AdminGroup>} - The deleted admin group.
   */
  public async hardDeleteOne(id: number): Promise<AdminGroup> {
    const adminGroup = await this.findById(id, { withDeleted: true });
    if (!adminGroup) {
      throw new NotFoundError('adminGroup.error.AdminGroup_not_found');
    }

    return this.delete({ id });
  }

  /**
   * Restores an admin group.
   * @param {number} id - The ID of the admin group to restore.
   * @returns {Promise<AdminGroup>} - The restored admin group.
   */
  public async restoreOne(id: number): Promise<AdminGroup> {
    const adminGroup = await this.findById(id, { withDeleted: true });
    if (!adminGroup) {
      throw new NotFoundError('adminGroup.error.AdminGroup_not_found');
    }

    return this.restore({ id });
  }

  /**
   * Retrieves a list of admin groups.
   * @param {GetAdminGroupListDto} query - The query parameters to use when retrieving the list of admin groups.
   * @returns {Promise<AdminGroup[]> | Promise<OffsetPaginatedResult<AdminGroup>>} - The list of admin groups.
   */
  public async findAll(
    query: GetAdminGroupListDto
  ): Promise<AdminGroup[] | OffsetPaginatedResult<AdminGroup>> {
    const { limit, page, isActive, search, withoutPagination, sortBy } = query;
    const where: Prisma.AdminGroupWhereInput = {
      isActive: isActive !== undefined ? isActive : undefined,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    if (withoutPagination) {
      return this.findMany({ where, orderBy: sortBy });
    }

    return this.offsetPaginate({
      pagination: {
        limit,
        page,
        withoutPagination,
        sortBy,
      },
      where,
      orderBy: sortBy,
    });
  }

  /**
   * Retrieves an admin group by its slug.
   * @param {string} slug - The slug of the admin group to retrieve.
   * @returns {Promise<AdminGroup | null>} - The admin group, or null if not found.
   */
  public async findBySlug(slug: string): Promise<AdminGroup | null> {
    return this.findOne({
      where: { slug },
    });
  }
}
