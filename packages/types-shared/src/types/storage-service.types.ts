import {
  FileOperationStatus,
  FileRegistryStatus,
  StorageEntity,
} from '@ecohatch/utils-shared';

/**
 * Parameters for generating a pre-signed URL for file upload.
 */
export type UploadUrlGenerationParams = {
  fileType: string;
  fileName: string;
  entityType: StorageEntity;
  entityId?: string;
};

export type FileReference = {
  entityId: string;
  entityType: StorageEntity;
  serviceName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FileRegistry = {
  id: string;
  fileUrl: string;
  ownerId: string;
  referenceCount: number;
  status: FileRegistryStatus;
  version: number;
  lastReferencedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type FileOperation = {
  id: string;
  operationId: string;
  fileUrl: string;
  status: FileOperationStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DistributedLock = {
  id: string;
  name: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
