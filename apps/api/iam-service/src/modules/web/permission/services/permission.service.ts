import { Injectable } from '@nestjs/common';
import { OffsetPaginatedResult } from '@ecohatch/types-shared';
import { SortDirection } from '@ecohatch/utils-shared';
import { Permission, Prisma } from '@prisma/client';

import { BasePermissionService, PrismaService } from '@/database';

import { GetPermissionListDto } from '../dtos';
import { IPermissionService } from '../interfaces';

/**
 * Service for managing permissions.
 *
 * @class PermissionService
 * @extends {BasePermissionService}
 * @implements {IPermissionService}
 */
@Injectable()
export class PermissionService
  extends BasePermissionService
  implements IPermissionService
{
  public constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  /**
   * Retrieves a list of permissions.
   * Supports filtering, searching, sorting, and pagination.
   *
   * @param {GetPermissionListDto} query - Query parameters for fetching permissions.
   * @returns {Promise<Permission[] | OffsetPaginatedResult<Permission>>}
   * - If `withoutPagination` is true, returns an array of `Permission[]`.
   * - Otherwise, returns a paginated result of `OffsetPaginatedResult<Permission>`.
   */
  public async findAll(
    query: GetPermissionListDto
  ): Promise<Permission[] | OffsetPaginatedResult<Permission>> {
    const { limit, page, search, withoutPagination, sortBy } = query;
    const where: Prisma.PermissionWhereInput = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};
    const include: Prisma.PermissionInclude = {
      permissionGroup: true,
    };
    const orderBy: Prisma.PermissionOrderByWithRelationInput = {
      permissionGroupId: SortDirection.ASC,
      sortOrder: SortDirection.ASC,
      ...sortBy,
    };

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
