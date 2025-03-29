import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OffsetPaginatedResult } from '@ecohatch/types-shared';
import {
  CurrentUser,
  CustomParseIntPipe,
  EntityPrimaryKey,
  ILogger,
  LOGGER,
  RequirePermission,
} from '@ecohatch/utils-api';
import { Action, ApiResponse, Resource } from '@ecohatch/utils-shared';
import {
  AdminGroupPermission,
  AdminPermission,
  Permission,
  PermissionGroup,
} from '@prisma/client';

import { ENDPOINT } from '@/constants';

import {
  ADMIN_GROUP_PERMISSION_SERVICE,
  ADMIN_PERMISSION_SERVICE,
  PERMISSION_GROUP_SERVICE,
  PERMISSION_SERVICE,
} from './constants';
import {
  AssignUserGroupPermissionDto,
  AssignUserPermissionDto,
  GetPermissionListDto,
} from './dtos';
import {
  IAdminGroupPermissionService,
  IAdminPermissionService,
  IPermissionGroupService,
  IPermissionService,
} from './interfaces';

/**
 * Controller for managing user permissions
 * @class PermissionController
 */
@Controller(ENDPOINT.Permission.Base)
@ApiTags('Permission')
export class PermissionController {
  public constructor(
    @Inject(LOGGER) private readonly _logger: ILogger,
    @Inject(PERMISSION_SERVICE)
    private readonly _permissionService: IPermissionService,
    @Inject(PERMISSION_GROUP_SERVICE)
    private readonly _permissionGroupService: IPermissionGroupService,
    @Inject(ADMIN_PERMISSION_SERVICE)
    private readonly _adminPermissionService: IAdminPermissionService,
    @Inject(ADMIN_GROUP_PERMISSION_SERVICE)
    private readonly _adminGroupPermissionService: IAdminGroupPermissionService
  ) {}

  /**
   * Assigns permissions to an admin
   * @param {AssignUserPermissionDto} data - Permission data
   * @param {EntityPrimaryKey} actionByUserAccountId - User account ID
   * @returns {Promise<ApiResponse<AdminPermission[]>>} Assigned permissions
   */
  @Post(ENDPOINT.Permission.Post.AssignPermissionsToAdmin)
  @ApiBody({ type: AssignUserPermissionDto })
  @RequirePermission({
    resource: Resource.ADMIN_PERMISSION,
    action: Action.UPDATE,
  })
  @ApiCreatedResponse({
    description: 'Permissions assigned successfully',
  })
  @ApiBadRequestResponse({
    description: 'Request body validation failed',
  })
  @ApiNotFoundResponse({
    description: 'Admin not found',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  public async assignPermissionsToAdmin(
    @Body() data: AssignUserPermissionDto,
    @CurrentUser('userAccountId') actionByUserAccountId: EntityPrimaryKey
  ): Promise<ApiResponse<AdminPermission[]>> {
    this._logger.debug(`Assigning permissions to admin: `, {
      data,
      actionByUserAccountId,
    });

    const adminPermissions = await this._adminPermissionService.assign(
      data,
      actionByUserAccountId
    );

    this._logger.info(`Assigned permissions to admin: `, {
      data: adminPermissions,
      actionByUserAccountId,
    });

    return new ApiResponse({
      message: 'permission.success.Permissions_assigned_successfully',
      result: adminPermissions,
      statusCode: HttpStatus.CREATED,
    });
  }

  /**
   * Assigns permissions to an admin group
   * @param {AssignUserGroupPermissionDto} data - Permission data
   * @param {EntityPrimaryKey} actionByUserAccountId - User account ID
   * @returns {Promise<ApiResponse<AdminGroupPermission[]>>} Assigned permissions
   */
  @Post(ENDPOINT.Permission.Post.AssignPermissionsToAdminGroup)
  @ApiBody({ type: AssignUserGroupPermissionDto })
  @RequirePermission({
    resource: Resource.ADMIN_GROUP_PERMISSION,
    action: Action.UPDATE,
  })
  @ApiCreatedResponse({
    description: 'Permissions assigned successfully',
  })
  @ApiBadRequestResponse({
    description: 'Request body validation failed',
  })
  @ApiNotFoundResponse({
    description: 'Admin group not found',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  public async assignPermissionsToAdminGroup(
    @Body() data: AssignUserGroupPermissionDto,
    @CurrentUser('userAccountId') actionByUserAccountId: EntityPrimaryKey
  ): Promise<ApiResponse<AdminGroupPermission[]>> {
    this._logger.debug(`Assigning permissions to admin group: `, {
      data,
      actionByUserAccountId,
    });

    const adminGroupPermissions =
      await this._adminGroupPermissionService.assign(
        data,
        actionByUserAccountId
      );

    this._logger.info(`Assigned permissions to admin group: `, {
      data: adminGroupPermissions,
      actionByUserAccountId,
    });

    return new ApiResponse({
      message: 'permission.success.Permissions_assigned_successfully',
      result: adminGroupPermissions,
      statusCode: HttpStatus.CREATED,
    });
  }

  /**
   * Revokes a permission from an admin
   * @param {number} adminId - Admin ID
   * @param {number} permissionId - Permission ID
   * @param {EntityPrimaryKey} actionByUserAccountId - User account ID
   * @returns {Promise<ApiResponse<null>>}
   */
  @Delete(ENDPOINT.Permission.Delete.RevokePermissionFromAdmin)
  @RequirePermission({
    resource: Resource.ADMIN_PERMISSION,
    action: Action.DELETE,
  })
  @ApiOkResponse({
    description: 'Permission revoked successfully',
  })
  @ApiBadRequestResponse({
    description: 'adminId or permissionId is not a valid integer',
  })
  @ApiNotFoundResponse({
    description: 'Admin or Permission not found',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  public async revokePermissionFromAdmin(
    @Param('adminId', CustomParseIntPipe) adminId: EntityPrimaryKey,
    @Param('permissionId', CustomParseIntPipe) permissionId: EntityPrimaryKey,
    @CurrentUser('userAccountId') actionByUserAccountId: EntityPrimaryKey
  ): Promise<ApiResponse<null>> {
    const loggerMetadata = {
      data: {
        adminId,
        permissionId,
      },
      actionByUserAccountId,
    };
    this._logger.debug(`Revoking permission from admin: `, loggerMetadata);

    await this._adminPermissionService.revoke(adminId, permissionId);

    this._logger.info(
      `Revoked permission ${permissionId} from admin: ${adminId}`,
      loggerMetadata
    );

    return new ApiResponse({
      message: 'permission.success.Permission_revoked_successfully',
      result: null,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Revokes a permission from an admin group
   * @param {number} adminGroupId - Admin group ID
   * @param {number} permissionId - Permission ID
   * @param {EntityPrimaryKey} actionByUserAccountId - User account ID
   * @returns {Promise<ApiResponse<null>>}
   */
  @Delete(ENDPOINT.Permission.Delete.RevokePermissionFromAdminGroup)
  @RequirePermission({
    resource: Resource.ADMIN_GROUP_PERMISSION,
    action: Action.DELETE,
  })
  @ApiOkResponse({
    description: 'Permission revoked successfully',
  })
  @ApiBadRequestResponse({
    description: 'adminGroupId or permissionId is not a valid integer',
  })
  @ApiNotFoundResponse({
    description: 'Admin group or Permission not found',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  public async revokePermissionFromAdminGroup(
    @Param('adminGroupId', CustomParseIntPipe) adminGroupId: EntityPrimaryKey,
    @Param('permissionId', CustomParseIntPipe) permissionId: EntityPrimaryKey,
    @CurrentUser('userAccountId') actionByUserAccountId: EntityPrimaryKey
  ): Promise<ApiResponse<null>> {
    const loggerMetadata = {
      data: {
        adminGroupId,
        permissionId,
      },
      actionByUserAccountId,
    };
    this._logger.debug(
      `Revoking permission from admin group: `,
      loggerMetadata
    );

    await this._adminGroupPermissionService.revoke(adminGroupId, permissionId);

    this._logger.info(
      `Revoked permission ${permissionId} from admin group: ${adminGroupId}`,
      loggerMetadata
    );

    return new ApiResponse({
      message: 'permission.success.Permission_revoked_successfully',
      result: null,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Retrieves a list of all available permissions
   * @param {GetPermissionListDto} query - Query parameters
   * @returns {Promise<ApiResponse<Permission[] | OffsetPaginatedResult<Permission>>>} List of permissions
   */
  @Get(ENDPOINT.Permission.Get.GetPermissionList)
  @RequirePermission({
    resource: Resource.PERMISSION,
    action: Action.READ,
  })
  @ApiOkResponse({
    description: 'Data fetched successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  public async getPermissionList(
    @Query() query: GetPermissionListDto
  ): Promise<ApiResponse<Permission[] | OffsetPaginatedResult<Permission>>> {
    this._logger.info('Fetching all permissions', { query });

    const permissionList = await this._permissionService.findAll(query);

    return new ApiResponse({
      message: 'common.success.Data_fetched_successfully',
      result: permissionList,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Retrieves a list of all available permission groups
   * @param {GetPermissionListDto} query - Query parameters
   * @returns {Promise<ApiResponse<PermissionGroup[] | OffsetPaginatedResult<PermissionGroup>>>} List of permission groups
   */
  @Get(ENDPOINT.Permission.Get.GetPermissionGroupList)
  @RequirePermission({
    resource: Resource.PERMISSION_GROUP,
    action: Action.READ,
  })
  @ApiOkResponse({
    description: 'Data fetched successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  public async getPermissionGroupList(
    @Query() query: GetPermissionListDto
  ): Promise<
    ApiResponse<PermissionGroup[] | OffsetPaginatedResult<PermissionGroup>>
  > {
    this._logger.info('Fetching all permission groups', { query });

    const permissionGroupList =
      await this._permissionGroupService.findAll(query);

    return new ApiResponse({
      message: 'common.success.Data_fetched_successfully',
      result: permissionGroupList,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Retrieves a list of permissions assigned to an admin
   * @param {number} adminId - Admin ID
   * @returns {Promise<ApiResponse<Permission[]>>} List of permissions
   */
  @Get(ENDPOINT.Permission.Get.GetAdminPermissions)
  @RequirePermission({
    resource: Resource.ADMIN_PERMISSION,
    action: Action.READ,
  })
  @ApiOkResponse({
    description: 'Data fetched successfully',
  })
  @ApiBadRequestResponse({
    description: 'adminId is not a valid integer',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  public async getAdminPermissions(
    @Param('adminId', CustomParseIntPipe) adminId: EntityPrimaryKey
  ): Promise<ApiResponse<Permission[]>> {
    this._logger.info('Fetching admin permissions: ', { query: { adminId } });

    const adminPermissions =
      await this._adminPermissionService.findAll(adminId);

    return new ApiResponse({
      message: 'common.success.Data_fetched_successfully',
      result: adminPermissions,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Retrieves a list of permissions assigned to an admin group
   * @param {number} adminGroupId - Admin group ID
   * @returns {Promise<ApiResponse<Permission[]>>} List of permissions
   */
  @Get(ENDPOINT.Permission.Get.GetAdminGroupPermissions)
  @RequirePermission({
    resource: Resource.ADMIN_GROUP_PERMISSION,
    action: Action.READ,
  })
  @ApiOkResponse({
    description: 'Data fetched successfully',
  })
  @ApiBadRequestResponse({
    description: 'adminGroupId is not a valid integer',
  })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  public async getAdminGroupPermissions(
    @Param('adminGroupId', CustomParseIntPipe) adminGroupId: EntityPrimaryKey
  ): Promise<ApiResponse<Permission[]>> {
    this._logger.info('Fetching admin group permissions: ', {
      query: { adminGroupId },
    });

    const adminGroupPermissions =
      await this._adminGroupPermissionService.findAll(adminGroupId);

    return new ApiResponse({
      message: 'common.success.Data_fetched_successfully',
      result: adminGroupPermissions,
      statusCode: HttpStatus.OK,
    });
  }
}
