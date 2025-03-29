import { Injectable } from '@nestjs/common';
import { OffsetPaginatedResult } from '@ecohatch/types-shared';
import { SortDirection } from '@ecohatch/utils-shared';
import { PermissionGroup, Prisma } from '@prisma/client';

import { BasePermissionGroupService, PrismaService } from '@/database';

import { GetPermissionListDto } from '../dtos';
import { IPermissionGroupService } from '../interfaces';

/**
 * Service for managing permission groups.
 *
 * @class PermissionGroupService
 * @extends {BasePermissionGroupService}
 * @implements {IPermissionGroupService}
 */
@Injectable()
export class PermissionGroupService
  extends BasePermissionGroupService
  implements IPermissionGroupService
{
  public constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  /**
   * Retrieves a list of permission groups.
   * Supports filtering, searching, sorting, and pagination.
   *
   * @param {GetPermissionListDto} query - Query parameters for fetching permission groups.
   * @returns {Promise<PermissionGroup[] | OffsetPaginatedResult<PermissionGroup>>}
   * - If `withoutPagination` is true, returns an array of `PermissionGroup[]`.
   * - Otherwise, returns a paginated result of `OffsetPaginatedResult<PermissionGroup>`.
   */
  public async findAll(
    query: GetPermissionListDto
  ): Promise<PermissionGroup[] | OffsetPaginatedResult<PermissionGroup>> {
    const { limit, page, search, withoutPagination, sortBy } = query;
    const where: Prisma.PermissionGroupWhereInput = {
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const include: Prisma.PermissionGroupInclude = {
      permissions: {
        orderBy: { sortOrder: SortDirection.ASC },
      },
    };
    const orderBy: Prisma.PermissionGroupOrderByWithRelationInput[] = [
      { sortOrder: SortDirection.ASC },
      ...Object.keys(sortBy).map((key) => ({ [key]: sortBy[key] })),
    ];

    if (withoutPagination) {
      return this.findMany({
        where,
        orderBy,
        include,
      });
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
      include,
    });
  }
}
