import { TFile, TGeneratedFileUploadUrl } from '@ecohatch/types-shared';

import { UploadUrlGenerationConfig } from '../types';

/**
 * Interface defining the contract for the StorageProvider
 *
 * @interface IStorageProvider
 */
export interface IStorageProvider {
  generateUploadUrl(
    config: UploadUrlGenerationConfig
  ): Promise<TGeneratedFileUploadUrl>;
  deleteFile(filePath: string): Promise<boolean>;
  confirmUpload(userId: string, filePath: string): Promise<TFile | null>;
}
