import { Body, Controller, HttpStatus, Inject, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse, ILogger, LoggerToken } from '@ecohatch/utils-api';
import { AdminGroup } from '@prisma/client';

import { EndPoint } from '@/constants';

import { AdminGroupServiceToken } from '../constants';
import { CreateAdminGroupDto } from '../dtos';
import { IAdminGroupService } from '../interfaces';

/**
 * Controller for managing admin groups.
 * Provides endpoints for creating, retrieving, updating, and deleting admin groups.
 *
 * @class AdminGroupController
 */
@Controller(EndPoint.AdminGroup.Base)
@ApiTags('Admin Groups')
export class AdminGroupController {
  public constructor(
    @Inject(AdminGroupServiceToken)
    private readonly _adminGroupService: IAdminGroupService,
    @Inject(LoggerToken) private readonly _logger: ILogger
  ) {}

  /**
   * Creates a new admin group.
   * @param {CreateAdminGroupDto} data - The data containing the details of the admin group to create.
   * @returns {Promise<ApiResponse<AdminGroup>>} - The created admin group.
   */
  @Post(EndPoint.AdminGroup.Post.CreateAdminGroup)
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
    this._logger.debug('Creating admin group: ', {
      name: data.name,
      slug: data.slug,
    });

    const adminGroup = await this._adminGroupService.create(data);

    this._logger.info('Created admin group: ', {
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
}
