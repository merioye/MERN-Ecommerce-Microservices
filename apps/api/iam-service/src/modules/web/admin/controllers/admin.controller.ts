import { Body, Controller, HttpStatus, Inject, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse, ILogger, LOGGER } from '@ecohatch/utils-api';
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
   * @returns The created admin
   */
  @Post(ENDPOINT.Admin.Post.CreateAdmin)
  @ApiBody({ type: CreateAdminDto })
  @ApiCreatedResponse({ description: 'Admin created successfully' })
  @ApiBadRequestResponse({ description: 'Admin already exists' })
  @ApiNotFoundResponse({ description: 'Admin group not found' })
  public async createAdmin(
    @Body() data: CreateAdminDto
  ): Promise<ApiResponse<Omit<Admin, 'password'>>> {
    this._logger.debug('Creating admin:', {
      ...data,
      password: '******',
    });

    const admin = await this._adminService.createOne(data);

    this._logger.info('Created admin:', {
      ...admin,
      password: '******',
    });

    return new ApiResponse({
      message: 'admin.success.Admin_created_successfully',
      result: admin,
      statusCode: HttpStatus.CREATED,
    });
  }
}
