import { Inject, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CRON_JOB_SERVICE,
  ICronJobService,
  ICronJobTask,
} from '@ecohatch/utils-api';

import {
  DistributedLockDocument,
  DistributedLockSchema,
  FileDocument,
  FileEventDocument,
  FileEventSchema,
  FileSchema,
} from '@/database';

import { CronJobTask } from '@/enums';

import {
  DISTRIBUTED_LOCK_SERVICE,
  FILE_EVENT_SERVICE,
  FILE_SERVICE,
  STORAGE_CLEANUP_TASK,
  STORAGE_PROVIDER,
} from './constants';
import {
  DistributedLockService,
  FileEventService,
  FileService,
} from './services';
import { S3StorageProvider } from './storage-providers';
import { StorageController } from './storage.controller';
import { StorageCleanupTask } from './tasks';
import { StorageCleanupTaskContext } from './types';

/**
 * The StorageModule is responsible for managing the storage operations within the application.
 * It integrates the necessary controllers and services to handle storage-related operations.
 *
 * @module StorageModule
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FileDocument.name, schema: FileSchema },
      { name: FileEventDocument.name, schema: FileEventSchema },
      { name: DistributedLockDocument.name, schema: DistributedLockSchema },
    ]),
  ],
  controllers: [StorageController],
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useClass: S3StorageProvider,
    },
    {
      provide: FILE_SERVICE,
      useClass: FileService,
    },
    {
      provide: FILE_EVENT_SERVICE,
      useClass: FileEventService,
    },
    {
      provide: DISTRIBUTED_LOCK_SERVICE,
      useClass: DistributedLockService,
    },
    {
      provide: STORAGE_CLEANUP_TASK,
      useClass: StorageCleanupTask,
    },
  ],
})
export class StorageModule {
  public constructor(
    @Inject(STORAGE_CLEANUP_TASK)
    private readonly _storageCleanupTask: ICronJobTask<StorageCleanupTaskContext>,
    @Inject(CRON_JOB_SERVICE)
    private readonly _cronJobService: ICronJobService
  ) {
    // Register tasks
    this._cronJobService.registerTask(
      CronJobTask.STORAGE_CLEANUP,
      this._storageCleanupTask
    );
  }
}
