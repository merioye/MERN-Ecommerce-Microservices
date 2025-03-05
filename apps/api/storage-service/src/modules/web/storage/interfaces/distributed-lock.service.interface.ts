import { TDistributedLock } from '@ecohatch/types-shared';
import { BaseMongooseService } from '@ecohatch/utils-api';

/**
 * Interface defining the contract for the DistributedLockService
 *
 * @interface IDistributedLockService
 * @extends BaseMongooseService<TDistributedLock>
 */
export interface IDistributedLockService
  extends BaseMongooseService<TDistributedLock> {}
