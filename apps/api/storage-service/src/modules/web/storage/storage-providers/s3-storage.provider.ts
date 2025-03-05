import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { TFile, TGeneratedFileUploadUrl } from '@ecohatch/types-shared';
import {
  Environment,
  ILogger,
  InternalServerError,
  LOGGER,
  NotFoundError,
} from '@ecohatch/utils-api';
import { FileStatus, StorageEntity } from '@ecohatch/utils-shared';
import { v4 as uuidv4 } from 'uuid';

import { Config } from '@/enums';

import { FILE_SERVICE } from '../constants';
import { IFileService, IStorageProvider } from '../interfaces';
import { UploadUrlGenerationConfig } from '../types';
import { BaseStorageService } from './base-storage.service';

/**
 * Service for handling AWS S3 storage operations.
 * Extends BaseStorageService and implements IStorageService interface.
 * Provides functionality for generating pre-signed URLs and managing files in S3.
 *
 * @class S3StorageService
 * @extends {BaseStorageService}
 * @implements {IStorageProvider}
 */
@Injectable()
export class S3StorageProvider
  extends BaseStorageService
  implements IStorageProvider
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
    @Inject(LOGGER) private readonly _logger: ILogger,
    @Inject(FILE_SERVICE) private readonly _fileService: IFileService
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
   * @returns {Promise<TGeneratedFileUploadUrl>} Pre-signed URL for file upload
   * @throws {InternalServerError} If URL generation fails
   */
  public async generateUploadUrl(
    config: UploadUrlGenerationConfig
  ): Promise<TGeneratedFileUploadUrl> {
    const { fileType, fileName, expiration, entityType, entityId } = config;
    // Validate
    this.validateFileType(fileType, entityType);
    const environment: Environment = this._configService.get<Environment>(
      Config.NODE_ENV
    )!;
    const uniqueId = uuidv4();

    const session = await this._fileService.startSession();

    try {
      // Generate unique filename and full object key
      const uniqueFileName = this.generateUniqueFileName(fileName, uniqueId);
      const objectKey = this.generateObjectKey(uniqueFileName, {
        entityType,
        entityId,
        environment,
      });

      // Create file record
      // TODO: Get userId from the authorized request
      const userId = '123';
      await this._fileService.create(
        {
          filePath: objectKey,
          ownerId: userId,
          status: FileStatus.PENDING,
          referenceCount: 0,
          lastReferencedAt: null,
        },
        null,
        { session }
      );

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

      await this._fileService.commitSession(session);

      return {
        filePath: objectKey,
        presignedUrl,
      };
    } catch (err) {
      await this._fileService.rollbackSession(session);

      this._logger.error('Error generating upload file URL:', err);
      throw new InternalServerError(
        'storage.error.Failed_to_generate_upload_URL'
      );
    }
  }

  /**
   * Confirms the upload of a file by updating the file status to ACTIVE
   * @param userId - The ID of the user who is performing the upload
   * @param filePath - The path of the file in the storage
   * @returns The updated file document if the upload is confirmed, null otherwise
   */
  public async confirmUpload(
    userId: string,
    filePath: string
  ): Promise<TFile | null> {
    const session = await this._fileService.startSession();

    try {
      // Verify file exists in S3
      const headCommand = new HeadObjectCommand({
        Bucket: this._bucketName,
        Key: filePath,
      });
      await this._client.send(headCommand);

      // Update file status
      const file = await this._fileService.update(
        { filePath, ownerId: userId, status: FileStatus.PENDING },
        { status: FileStatus.ACTIVE },
        null,
        { session }
      );

      if (!file) {
        throw new NotFoundError('File not found');
      }

      await this._fileService.commitSession(session);
      return file;
    } catch (error) {
      // Cleanup if S3 upload failed
      if ((error as { code?: string })?.code === 'NotFound') {
        await this._fileService.delete({ filePath }, { session });
      }
      await this._fileService.rollbackSession(session);

      this._logger.error(
        `Upload confirmation failed for file ${filePath}: ${error instanceof Error ? error.message : JSON.stringify(error)}`
      );
      return null;
    }
  }

  /**
   * Deletes a file from S3 bucket.
   *
   * @param {string} objectPath - The full path of the object in S3
   * @returns {Promise<boolean>} True if deletion was successful, false otherwise
   */
  public async deleteFile(objectPath: string): Promise<boolean> {
    try {
      const objectKey = this.extractObjectKeyFromPath(objectPath);
      await this._client.send(
        new DeleteObjectCommand({
          Bucket: this._bucketName,
          Key: objectKey,
        })
      );

      return true;
    } catch (error) {
      this._logger.error('Error deleting file from S3:', {
        filePath: objectPath,
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
   * Extracts the object key from a given S3 object path.
   *
   * @param {string} objectPath - The full path of the object in S3
   * @returns {string} The extracted object key
   */
  private extractObjectKeyFromPath(objectPath: string): string {
    const urlParts = objectPath.split('/');
    return urlParts.slice(3).join('/');
  }
}
