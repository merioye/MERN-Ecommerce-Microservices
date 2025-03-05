import { UploadUrlGenerationParams } from '@ecohatch/types-shared';

/**
 * Configuration object for generating a pre-signed URL for file upload.
 */
export type UploadUrlGenerationConfig = {
  expiration: number;
} & UploadUrlGenerationParams;

/**
 * Context object for the storage cleanup task.
 */
export type StorageCleanupTaskContext = {
  RETENTION_DAYS: number;
};
