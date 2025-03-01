import { UploadUrlGenerationConfig } from '../types';

export interface IStorageService {
  generateUploadUrl(config: UploadUrlGenerationConfig): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
}
