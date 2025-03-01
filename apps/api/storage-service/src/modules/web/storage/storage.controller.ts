import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ILogger, InternalServerError, LOGGER } from '@ecohatch/utils-api';
import { ApiResponse } from '@ecohatch/utils-shared';

import { Config } from '@/enums';
import { ENDPOINT } from '@/constants';

import { STORAGE_SERVICE } from './constants';
import { GenerateUploadUrlDto } from './dtos';
import { IStorageService } from './interfaces';

/**
 * Controller handling file storage operations.
 * Provides endpoints for generating upload URLs and managing stored files.
 *
 * @class StorageController
 */
@Controller(ENDPOINT.Storage.Base)
@ApiTags('Storage')
export class StorageController {
  public constructor(
    @Inject(STORAGE_SERVICE)
    private readonly _storageService: IStorageService,
    @Inject(LOGGER) private readonly _logger: ILogger,
    private readonly _configService: ConfigService
  ) {}

  /**
   * Generates a pre-signed URL for file upload.
   * The URL will expire after a configured duration.
   *
   * @param {GenerateUploadUrlDto} config - Configuration for URL generation
   * @returns {Promise<ApiResponse<{ url: string }>>} Response containing the generated upload URL
   *
   * @example
   * GET /storage/upload-url?fileType=image/jpeg&fileName=example.jpg&entityType=USER_AVATAR
   *
   * @throws {BadRequestError} When an invalid file type is provided
   * @throws {InternalServerError} When URL generation fails
   */
  @Get(ENDPOINT.Storage.Get.GenerateUploadUrl)
  @ApiQuery({ type: GenerateUploadUrlDto })
  @ApiOkResponse({
    description: 'Upload URL generated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid file type provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to generate upload URL',
  })
  public async generateUploadUrl(
    @Query() config: GenerateUploadUrlDto
  ): Promise<ApiResponse<{ url: string }>> {
    this._logger.debug('Generating upload URL with config:', config);

    const presignedUrl = await this._storageService.generateUploadUrl({
      ...config,
      expiration: this._configService.get<number>(
        Config.UPLOAD_FILE_URL_EXPIRATION
      )!,
    });

    this._logger.info('Generated upload URL:', {
      url: presignedUrl,
    });

    return new ApiResponse({
      message: 'storage.success.Upload_url_generated_successfully',
      result: {
        url: presignedUrl,
      },
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Deletes a file from storage using its unique identifier.
   *
   * @param {string} fileUrl - The encoded URL of the file to delete
   * @returns {Promise<ApiResponse<null>>} Response indicating successful deletion
   *
   * @example
   * DELETE /storage/files/encoded-url
   *
   * @throws {InternalServerError} When file deletion fails
   */
  @Delete(ENDPOINT.Storage.Delete.DeleteFile)
  @ApiOkResponse({
    description: 'File deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Failed to delete the file',
  })
  public async deleteFile(
    @Param() fileUrl: string
  ): Promise<ApiResponse<null>> {
    const decodedFileUrl = decodeURIComponent(fileUrl);

    this._logger.debug('Deleting file with ID:', decodedFileUrl);

    const isDeleted = await this._storageService.deleteFile(decodedFileUrl);
    if (!isDeleted) {
      throw new InternalServerError('storage.error.Failed_to_delete_the_file');
    }

    this._logger.info('Deleted file with ID:', decodedFileUrl);

    return new ApiResponse({
      message: 'storage.success.File_deleted_successfully',
      result: null,
      statusCode: HttpStatus.OK,
    });
  }
}
