import { Body, Controller, HttpStatus, Inject, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CurrentUser,
  EntityPrimaryKey,
  ILogger,
  LOGGER,
  Roles,
} from '@ecohatch/utils-api';
import { ApiResponse, Role } from '@ecohatch/utils-shared';
import { Admin } from '@prisma/client';

import { ENDPOINT } from '@/constants';

import { ADMIN_SERVICE } from '../constants';
import { CreateAdminDto } from '../dtos';
import { IAdminService } from '../interfaces';

/** The controller responsible for handling admin ENDPOINTs.
 *
 * @class AdminController
 */
@Controller(ENDPOINT.Admin.Base)
@ApiTags('Admins')
@Roles(Role.ADMIN)
export class AdminController {
  public constructor(
    @Inject(ADMIN_SERVICE)
    private readonly _adminService: IAdminService,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {}

  /**
   * Creates a new admin.
   *
   * @param data - The data to create the admin with
   * @param actionByUserAccountId - The currently logged in user account ID
   * @returns The created admin
   */
  @Post(ENDPOINT.Admin.Post.CreateAdmin)
  @ApiBody({ type: CreateAdminDto })
  @ApiCreatedResponse({ description: 'Admin created successfully' })
  @ApiBadRequestResponse({
    description: 'Request body validation failed | Admin already exists',
  })
  @ApiNotFoundResponse({ description: 'Admin group not found' })
  @ApiUnauthorizedResponse({
    description: 'User authentication failed',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  public async createAdmin(
    @Body() data: CreateAdminDto,
    @CurrentUser('userAccountId') actionByUserAccountId: EntityPrimaryKey
  ): Promise<ApiResponse<Omit<Admin, 'password'>>> {
    this._logger.debug('Creating admin:', {
      data: {
        ...data,
        password: '******',
      },
      actionByUserAccountId,
    });

    const admin = await this._adminService.createOne(
      data,
      actionByUserAccountId
    );

    this._logger.info('Created admin:', {
      data: {
        ...admin,
        password: '******',
      },
      actionByUserAccountId,
    });

    return new ApiResponse({
      message: 'admin.success.Admin_created_successfully',
      result: admin,
      statusCode: HttpStatus.CREATED,
    });
  }
}
