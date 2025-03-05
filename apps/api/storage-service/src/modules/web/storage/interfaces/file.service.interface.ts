import { TFile } from '@ecohatch/types-shared';
import { BaseMongooseService, MongoosePrimaryKey } from '@ecohatch/utils-api';
import { ClientSession } from 'mongoose';

/**
 * Interface defining the contract for the FileService
 *
 * @interface IFileService
 * @extends BaseMongooseService<TFile>
 */
export interface IFileService extends BaseMongooseService<TFile> {
  updateFileReferenceCount(
    fileId: MongoosePrimaryKey,
    delta: number,
    currentVersion: number,
    session?: ClientSession
  ): Promise<TFile | null>;
}
