import { Injectable } from '@nestjs/common';
import { OffsetPaginatedResult } from '@ecohatch/types-shared';
import {
  BadRequestError,
  EntityPrimaryKey,
  InternalServerError,
  NotFoundError,
} from '@ecohatch/utils-api';
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
   * @param {EntityPrimaryKey} actionByUserAccountId - The ID of the user's account performing the action.
   * @returns {Promise<AdminGroup>} - The created admin group.
   */
  public async createOne(
    data: CreateAdminGroupDto,
    actionByUserAccountId: EntityPrimaryKey
  ): Promise<AdminGroup> {
    const isExistingGroup = await this.findOne({
      where: { slug: data.slug },
      withDeleted: true,
    });
    if (isExistingGroup) {
      throw new BadRequestError('adminGroup.error.AdminGroup_already_exists');
    }

    return this.create(data, actionByUserAccountId);
  }

  /**
   * Updates an admin group.
   * @param {UpdateAdminGroupDto} data - The data containing the details of the admin group to update.
   * @param {EntityPrimaryKey} id - The ID of the admin group to update.
   * @param {EntityPrimaryKey} actionByUserAccountId - The ID of the user's account performing the action.
   * @returns {Promise<AdminGroup>} - The updated admin group.
   */
  public async updateOne(
    id: EntityPrimaryKey,
    data: UpdateAdminGroupDto,
    actionByUserAccountId: EntityPrimaryKey
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

    const updatedAdminGroup = await this.update(
      { id: this.parseId(id) },
      data,
      actionByUserAccountId
    );
    if (!updatedAdminGroup) {
      throw new InternalServerError('adminGroup.error.AdminGroup_not_updated');
    }

    return updatedAdminGroup;
  }

  /**
   * Soft deletes an admin group.
   * @param {EntityPrimaryKey} id - The ID of the admin group to delete.
   * @param {EntityPrimaryKey} actionByUserAccountId - The ID of the user's account performing the action.
   * @returns {Promise<AdminGroup>} - The deleted admin group.
   */
  public async softDeleteOne(
    id: EntityPrimaryKey,
    actionByUserAccountId: EntityPrimaryKey
  ): Promise<AdminGroup> {
    const deletedAdminGroup = await this.softDelete(
      { id: this.parseId(id) },
      actionByUserAccountId
    );
    if (!deletedAdminGroup) {
      throw new NotFoundError('adminGroup.error.AdminGroup_not_found');
    }

    return deletedAdminGroup;
  }

  /**
   * Hard deletes an admin group.
   * @param {EntityPrimaryKey} id - The ID of the admin group to delete.
   * @returns {Promise<AdminGroup>} - The deleted admin group.
   */
  public async hardDeleteOne(id: EntityPrimaryKey): Promise<AdminGroup> {
    const deletedAdminGroup = await this.delete({ id: this.parseId(id) });
    if (!deletedAdminGroup) {
      throw new NotFoundError('adminGroup.error.AdminGroup_not_found');
    }

    return deletedAdminGroup;
  }

  /**
   * Restores an admin group.
   * @param {EntityPrimaryKey} id - The ID of the admin group to restore.
   * @returns {Promise<AdminGroup>} - The restored admin group.
   */
  public async restoreOne(id: EntityPrimaryKey): Promise<AdminGroup> {
    const restoredAdminGroup = await this.restore({ id: this.parseId(id) });
    if (!restoredAdminGroup) {
      throw new NotFoundError('adminGroup.error.AdminGroup_not_found');
    }

    return restoredAdminGroup;
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
    const orderBy: Prisma.AdminGroupOrderByWithRelationInput[] = Object.keys(
      sortBy
    )?.map((key) => ({ [key]: sortBy[key] }));

    if (withoutPagination) {
      return this.findMany({ where, orderBy });
    }

    return this.offsetPaginate({
      pagination: {
        limit,
        page,
        withoutPagination,
        sortBy,
      },
      where,
      orderBy,
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
