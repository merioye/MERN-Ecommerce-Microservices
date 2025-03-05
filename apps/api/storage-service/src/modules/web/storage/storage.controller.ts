import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TGeneratedFileUploadUrl } from '@ecohatch/types-shared';
import { ILogger, InternalServerError, LOGGER } from '@ecohatch/utils-api';
import { ApiResponse } from '@ecohatch/utils-shared';

import { Config } from '@/enums';
import { ENDPOINT } from '@/constants';

import { STORAGE_PROVIDER } from './constants';
import { GenerateUploadUrlDto } from './dtos';
import { IStorageProvider } from './interfaces';

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
    @Inject(STORAGE_PROVIDER)
    private readonly _storageProvider: IStorageProvider,
    @Inject(LOGGER) private readonly _logger: ILogger,
    private readonly _configService: ConfigService
  ) {}

  /**
   * Generates a pre-signed URL for file upload.
   * The URL will expire after a configured duration.
   *
   * @param {GenerateUploadUrlDto} config - Configuration for URL generation
   * @returns {Promise<ApiResponse<TGeneratedFileUploadUrl>>} Response containing the generated upload URL
   *
   * @example
   * GET /storage/upload-url?fileType=image/jpeg&fileName=example.jpg&entityType=USER_AVATAR
   *
   * @throws {BadRequestError} When an invalid file type is provided
   * @throws {InternalServerError} When URL generation fails
   */
  @Get(ENDPOINT.Storage.Get.GenerateUploadUrl)
  @ApiOperation({ summary: 'Generates a URL to upload a file' })
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
  ): Promise<ApiResponse<TGeneratedFileUploadUrl>> {
    this._logger.debug('Generating upload URL with config:', config);

    const generatedUrl = await this._storageProvider.generateUploadUrl({
      ...config,
      expiration: this._configService.get<number>(
        Config.UPLOAD_FILE_URL_EXPIRATION
      )!,
    });

    this._logger.info('Generated upload URL:', generatedUrl);

    return new ApiResponse({
      message: 'storage.success.Upload_url_generated_successfully',
      result: generatedUrl,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Deletes a file from storage using its unique identifier.
   *
   * @param {string} filePath - The encoded unique path of the file to delete
   * @returns {Promise<ApiResponse<null>>} Response indicating successful deletion
   *
   * @example
   * DELETE /storage/files/encoded-path
   *
   * @throws {InternalServerError} When file deletion fails
   */
  @Delete(ENDPOINT.Storage.Delete.DeleteFile)
  @ApiOperation({
    summary: 'Deletes a file by its unique path. The path should be encoded.',
  })
  @ApiOkResponse({
    description: 'File deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Failed to delete the file',
  })
  public async deleteFile(
    @Param('file-path') filePath: string
  ): Promise<ApiResponse<null>> {
    const decodedFilePath = decodeURIComponent(filePath);

    this._logger.debug('Deleting file with path:', decodedFilePath);

    const isDeleted = await this._storageProvider.deleteFile(decodedFilePath);
    if (!isDeleted) {
      throw new InternalServerError('storage.error.Failed_to_delete_the_file');
    }

    this._logger.info('Deleted file with path:', decodedFilePath);

    return new ApiResponse({
      message: 'storage.success.File_deleted_successfully',
      result: null,
      statusCode: HttpStatus.OK,
    });
  }

  /**
   * Confirms the upload of a file by its unique identifier.
   *
   * @param {string} filePath - The encoded unique path of the file to confirm upload
   * @returns {Promise<ApiResponse<boolean>>} Response indicating successful confirmation
   *
   */
  @Patch(ENDPOINT.Storage.Update.ConfirmUpload)
  @ApiOperation({
    summary: 'Confirms the upload of a file by its unique identifier.',
  })
  @ApiOkResponse({
    description: 'File upload confirmed successfully',
  })
  public async confirmUpload(
    @Param('file-path') filePath: string
  ): Promise<ApiResponse<boolean>> {
    const decodedFilePath = decodeURIComponent(filePath);

    this._logger.debug('Confirming file upload with path:', decodedFilePath);

    // TODO: Get userId from the authorized request
    const userId = '123';
    const isConfirmed = await this._storageProvider.confirmUpload(
      userId,
      decodedFilePath
    );

    this._logger.info('Confirmed file upload with path:', decodedFilePath);

    return new ApiResponse({
      message: 'storage.success.File_upload_confirmed_successfully',
      result: isConfirmed ? true : false,
      statusCode: HttpStatus.OK,
    });
  }
}
