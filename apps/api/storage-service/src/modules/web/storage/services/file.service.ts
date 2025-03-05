import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TFile } from '@ecohatch/types-shared';
import { BaseMongooseService, MongoosePrimaryKey } from '@ecohatch/utils-api';
import { ClientSession, Model } from 'mongoose';

import { FileDocument } from '@/database';

/**
 * Service class for managing files
 * @class FileService
 * @extends BaseMongooseService<TFile>
 */
@Injectable()
export class FileService extends BaseMongooseService<TFile> {
  public constructor(@InjectModel(FileDocument.name) fileModel: Model<TFile>) {
    super(fileModel);
  }

  public async updateFileReferenceCount(
    fileId: MongoosePrimaryKey,
    delta: number,
    currentVersion: number,
    session?: ClientSession
  ): Promise<TFile | null> {
    return this.updateWithOptimisticLock(
      fileId,
      {
        $inc: { referenceCount: delta },
        $set: { lastReferencedAt: new Date() },
      },
      currentVersion,
      null,
      { session }
    );
  }
}
