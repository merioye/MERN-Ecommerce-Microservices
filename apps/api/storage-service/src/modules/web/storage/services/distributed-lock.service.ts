import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TDistributedLock } from '@ecohatch/types-shared';
import { BaseMongooseService } from '@ecohatch/utils-api';
import { Model } from 'mongoose';

import { DistributedLockDocument } from '@/database';

/**
 * Service class for managing distributed locks
 * @class DistributedLockService
 * @extends BaseMongooseService<TDistributedLock>
 */
@Injectable()
export class DistributedLockService extends BaseMongooseService<TDistributedLock> {
  public constructor(
    @InjectModel(DistributedLockDocument.name)
    distributedLockModel: Model<TDistributedLock>
  ) {
    super(distributedLockModel);
  }
}
