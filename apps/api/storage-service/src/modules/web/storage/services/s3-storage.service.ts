import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  Environment,
  ILogger,
  InternalServerError,
  LOGGER,
} from '@ecohatch/utils-api';
import { StorageEntity } from '@ecohatch/utils-shared';
import { v4 as uuidv4 } from 'uuid';

import { Config } from '@/enums';

import { IStorageService } from '../interfaces';
import { UploadUrlGenerationConfig } from '../types';
import { BaseStorageService } from './base-storage.service';

/**
 * Service for handling AWS S3 storage operations.
 * Extends BaseStorageService and implements IStorageService interface.
 * Provides functionality for generating pre-signed URLs and managing files in S3.
 *
 * @class S3StorageService
 * @extends {BaseStorageService}
 * @implements {IStorageService}
 */
@Injectable()
export class S3StorageService
  extends BaseStorageService
  implements IStorageService
{
  private readonly _client: S3Client;
  private readonly _bucketName: string;

  /**
   * Initializes the S3 storage service with necessary configurations.
   *
   * @param {ConfigService} _configService - NestJS config service for accessing environment variables
   * @param {ILogger} _logger - Logger interface for error tracking
   */
  public constructor(
    private readonly _configService: ConfigService,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {
    super();
    this._bucketName = this._configService.get(Config.AWS_S3_BUCKET_NAME)!;
    this._client = new S3Client({
      region: this._configService.get(Config.AWS_REGION),
      credentials: {
        accessKeyId: this._configService.get(Config.AWS_ACCESS_KEY_ID)!,
        secretAccessKey: this._configService.get(Config.AWS_SECRET_ACCESS_KEY)!,
      },
      endpoint: this._configService.get(Config.AWS_S3_ENDPOINT),
      forcePathStyle:
        this._configService.get(Config.NODE_ENV) !== Environment.PROD,
    });
  }

  /**
   * Generates a pre-signed URL for uploading a file to S3.
   *
   * @param {UploadUrlGenerationConfig} config - Configuration object containing file details
   * @param {string} config.fileType - MIME type of the file
   * @param {string} config.fileName - Original name of the file
   * @param {number} config.expiration - URL expiration time in seconds
   * @param {StorageEntity} config.entityType - Type of entity the file belongs to
   * @param {string} [config.entityId] - Optional ID of the entity
   * @returns {Promise<string>} Pre-signed URL for file upload
   * @throws {InternalServerError} If URL generation fails
   */
  public async generateUploadUrl(
    config: UploadUrlGenerationConfig
  ): Promise<string> {
    const { fileType, fileName, expiration, entityType, entityId } = config;
    // Validate
    this.validateFileType(fileType, entityType);
    const environment: Environment = this._configService.get<Environment>(
      Config.NODE_ENV
    )!;
    const uniqueId = uuidv4();

    try {
      // Generate unique filename and full object key
      const uniqueFileName = this.generateUniqueFileName(fileName, uniqueId);
      const objectKey = this.generateObjectKey(uniqueFileName, {
        entityType,
        entityId,
        environment,
      });

      // Create command for PUT operation
      const putCommand = new PutObjectCommand({
        Bucket: this._bucketName,
        Key: objectKey,
        ContentType: fileType,
        Metadata: {
          entityType,
          entityId: entityId || '',
          originalName: fileName,
          uniqueId,
          environment,
        },
      });

      // Generate presigned URL
      const presignedUrl = await getSignedUrl(this._client, putCommand, {
        expiresIn: expiration,
      });

      return presignedUrl;
    } catch (err) {
      this._logger.error('Error generating upload file URL:', err);
      throw new InternalServerError(
        'storage.error.Failed_to_generate_upload_URL'
      );
    }
  }

  /**
   * Deletes a file from S3 bucket.
   *
   * @param {string} objectUrl - The full URL of the object in S3
   * @returns {Promise<boolean>} True if deletion was successful, false otherwise
   */
  public async deleteFile(objectUrl: string): Promise<boolean> {
    try {
      const objectKey = this.extractObjectKeyFromUrl(objectUrl);
      await this._client.send(
        new DeleteObjectCommand({
          Bucket: this._bucketName,
          Key: objectKey,
        })
      );

      return true;
    } catch (error) {
      this._logger.error('Error deleting file from S3:', {
        fileUrl: objectUrl,
        error,
      });
      return false;
    }
  }

  /**
   * Generates an object key (path) for S3 storage based on provided configuration.
   *
   * @param {string} fileName - The unique file name
   * @param {Object} config - Configuration object for object key generation
   * @param {StorageEntity} config.entityType - Type of entity the object belongs to
   * @param {string} [config.entityId] - Optional ID of the entity
   * @param {Environment} config.environment - Current environment (development/production)
   * @returns {string} Generated object key in format: environment/entityType/[entityId]/fileName
   */
  private generateObjectKey(
    fileName: string,
    config: {
      entityType: StorageEntity;
      entityId?: string;
      environment: Environment;
    }
  ): string {
    const parts = [
      config.environment,
      config.entityType,
      config.entityId,
      fileName,
    ].filter(Boolean);

    return parts.join('/');
  }

  /**
   * Extracts the object key from a given S3 object URL.
   *
   * @param {string} objectUrl - The full URL of the object in S3
   * @returns {string} The extracted object key
   */
  private extractObjectKeyFromUrl(objectUrl: string): string {
    const urlParts = objectUrl.split('/');
    return urlParts.slice(3).join('/');
  }
}
