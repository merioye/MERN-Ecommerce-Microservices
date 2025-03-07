import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OffsetPaginatedResult } from '@ecohatch/types-shared';
import {
  CustomParseIntPipe,
  EntityPrimaryKey,
  ILogger,
  LOGGER,
} from '@ecohatch/utils-api';
import { ApiResponse } from '@ecohatch/utils-shared';
import { AdminGroup } from '@prisma/client';

import { ENDPOINT } from '@/constants';

import { ADMIN_GROUP_SERVICE } from '../constants';
import {
  CreateAdminGroupDto,
  GetAdminGroupListDto,
  UpdateAdminGroupDto,
} from '../dtos';
import { IAdminGroupService } from '../interfaces';

/**
 * Controller for managing admin groups.
 * Provides ENDPOINTs for creating, retrieving, updating, and deleting admin groups.
 *
 * @class AdminGroupController
 */
@Controller(ENDPOINT.AdminGroup.Base)
@ApiTags('Admin Groups')
export class AdminGroupController {
  public constructor(
    @Inject(ADMIN_GROUP_SERVICE)
    private readonly _adminGroupService: IAdminGroupService,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {}

  /**
   * Creates a new admin group.
   * @param {CreateAdminGroupDto} data - The data containing the details of the admin group to create.
   * @returns {Promise<ApiResponse<AdminGroup>>} - The created admin group.
   */
  @Post(ENDPOINT.AdminGroup.Post.CreateAdminGroup)
  @ApiBody({ type: CreateAdminGroupDto })
  @ApiCreatedResponse({
    description: 'Admin group created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Admin group already exists',
  })
  public async createAdminGroup(
    @Body() data: CreateAdminGroupDto
  ): Promise<ApiResponse<AdminGroup>> {
    this._logger.debug('Creating admin group:', {
      name: data.name,
      slug: data.slug,
    });

    const adminGroup = await this._adminGroupService.createOne(data);

    this._logger.info('Created admin group:', {
      id: adminGroup.id,
      name: adminGroup.name,
      slug: adminGroup.slug,
    });

    return new ApiResponse({
      message: 'adminGroup.success.AdminGroup_created_successfully',
      result: adminGroup,
      statusCode: HttpStatus.CREATED,
    });
  }

  /**
   * Updates an admin group.
   * @param {UpdateAdminGroupDto} data - The data containing the details of the admin group to update.
   * @param {EntityPrimaryKey} id - The ID of the admin group to update.
   * @returns {Promise<ApiResponse<AdminGroup>>} - The updated admin group.
   */
  @Patch(ENDPOINT.AdminGroup.Patch.UpdateAdminGroup)
  @ApiBody({ type: UpdateAdminGroupDto })
  @ApiOkResponse({
    description: 'Admin group updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Admin group not found',
  })
  public async updateAdminGroup(
    @Body() data: UpdateAdminGroupDto,
    @Param('id', CustomParseIntPipe) id: EntityPrimaryKey
  ): Promise<ApiResponse<AdminGroup>> {
    this._logger.debug('Updating admin group:', {
      id,
      ...data,
    });

    const adminGroup = await this._adminGroupService.updateOne(id, data);

    this._logger.info('Updated admin group:', adminGroup);

    return new ApiResponse({
      message: 'adminGroup.success.AdminGroup_updated_successfully',
      result: adminGroup,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Soft Deletes an admin group.
   * @param {EntityPrimaryKey} id - The ID of the admin group to delete.
   * @returns {Promise<ApiResponse<null>>}
   */
  @Delete(ENDPOINT.AdminGroup.Delete.SoftDeleteAdminGroup)
  @ApiOkResponse({
    description: 'Admin group deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Admin group not found',
  })
  @ApiBadRequestResponse({
    description: 'id is not a valid integer',
  })
  public async softDeleteAdminGroup(
    @Param('id', CustomParseIntPipe) id: EntityPrimaryKey
  ): Promise<ApiResponse<null>> {
    this._logger.debug('Soft deleting admin group:', id);

    const adminGroup = await this._adminGroupService.softDeleteOne(id);

    this._logger.info('Soft deleted admin group:', adminGroup);

    return new ApiResponse({
      message: 'adminGroup.success.AdminGroup_deleted_successfully',
      result: null,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Hard Deletes an admin group.
   * @param {EntityPrimaryKey} id - The ID of the admin group to delete.
   * @returns {Promise<ApiResponse<null>>}
   */
  @Delete(ENDPOINT.AdminGroup.Delete.HardDeleteAdminGroup)
  @ApiOkResponse({
    description: 'Admin group hard deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Admin group not found',
  })
  @ApiBadRequestResponse({
    description: 'id is not a valid integer',
  })
  public async hardDeleteAdminGroup(
    @Param('id', CustomParseIntPipe) id: EntityPrimaryKey
  ): Promise<ApiResponse<null>> {
    this._logger.debug('Hard deleting admin group:', id);

    const adminGroup = await this._adminGroupService.hardDeleteOne(id);

    this._logger.info('Hard deleted admin group:', adminGroup);

    return new ApiResponse({
      message: 'adminGroup.success.AdminGroup_hard_deleted_successfully',
      result: null,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Restores an admin group.
   * @param {EntityPrimaryKey} id - The ID of the admin group to restore.
   * @returns {Promise<ApiResponse<null>>}
   */
  @Patch(ENDPOINT.AdminGroup.Patch.RestoreAdminGroup)
  @ApiOkResponse({
    description: 'Admin group restored successfully',
  })
  @ApiNotFoundResponse({
    description: 'Admin group not found',
  })
  @ApiBadRequestResponse({
    description: 'id is not a valid integer',
  })
  public async restoreAdminGroup(
    @Param('id', CustomParseIntPipe) id: EntityPrimaryKey
  ): Promise<ApiResponse<AdminGroup>> {
    this._logger.debug('Restoring admin group:', id);

    const adminGroup = await this._adminGroupService.restoreOne(id);

    this._logger.info('Restored admin group:', adminGroup);

    return new ApiResponse({
      message: 'adminGroup.success.AdminGroup_restored_successfully',
      result: adminGroup,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Gets a list of all admin groups.
   * @param {GetAdminGroupListDto} query - The query parameters for the request.
   * @returns {Promise<ApiResponse<AdminGroup[] | OffsetPaginatedResult<AdminGroup>>>} - The list of admin groups.
   */
  @Get(ENDPOINT.AdminGroup.Get.GetAdminGroupList)
  @ApiOkResponse({
    description: 'Data fetched successfully',
  })
  @ApiBadRequestResponse({
    description: 'Request query Validation failed',
  })
  public async getAdminGroupList(
    @Query() query: GetAdminGroupListDto
  ): Promise<ApiResponse<AdminGroup[] | OffsetPaginatedResult<AdminGroup>>> {
    this._logger.debug('Getting admin group list:', query);

    const adminGroupList = await this._adminGroupService.findAll(query);

    return new ApiResponse({
      message: 'common.success.Data_fetched_successfully',
      result: adminGroupList,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Gets an admin group by slug.
   * @param {string} slug - The slug of the admin group to retrieve.
   * @returns {Promise<ApiResponse<AdminGroup | null>>>} - The admin group.
   */
  @Get(ENDPOINT.AdminGroup.Get.GetAdminGroupBySlug)
  @ApiOkResponse({
    description: 'Data fetched successfully',
  })
  public async getAdminGroupBySlug(
    @Param('slug') slug: string
  ): Promise<ApiResponse<AdminGroup | null>> {
    this._logger.debug('Getting admin group by slug:', slug);

    const adminGroup = await this._adminGroupService.findBySlug(slug);

    return new ApiResponse({
      message: 'common.success.Data_fetched_successfully',
      result: adminGroup,
      statusCode: HttpStatus.OK,
    });
  }
}
