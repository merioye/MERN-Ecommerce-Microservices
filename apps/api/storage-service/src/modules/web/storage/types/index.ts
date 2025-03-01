import { UploadUrlGenerationParams } from '@ecohatch/types-shared';

/**
 * Configuration object for generating a pre-signed URL for file upload.
 */
export type UploadUrlGenerationConfig = {
  expiration: number;
} & UploadUrlGenerationParams;
