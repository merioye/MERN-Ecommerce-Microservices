import {
  FileEventStatus,
  FileEventType,
  FileStatus,
  StorageEntity,
} from '@ecohatch/utils-shared';
import { VERSION_COLUMN } from '../constants';

/**
 * Parameters for generating a pre-signed URL for file upload.
 */
export type UploadUrlGenerationParams = {
  fileType: string;
  fileName: string;
  entityType: StorageEntity;
  entityId?: string;
};

export type TFile = {
  _id: string;
  filePath: string;
  ownerId: string;
  referenceCount: number;
  status: FileStatus;
  [VERSION_COLUMN]: number;
  lastReferencedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TFileEvent = {
  _id: string;
  eventId: string;
  filePath: string;
  type: FileEventType;
  status: FileEventStatus;
  [VERSION_COLUMN]: number;
  result: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

export type TDistributedLock = {
  _id: string;
  name: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

// ########################################### API Response Types ###########################################
export type TGeneratedFileUploadUrl = {
  filePath: string;
  presignedUrl: string;
};
