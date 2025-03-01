import { Module } from '@nestjs/common';

import { STORAGE_SERVICE } from './constants';
import { S3StorageService } from './services';
import { StorageController } from './storage.controller';

/**
 * The StorageModule is responsible for managing the storage operations within the application.
 * It integrates the necessary controllers and services to handle storage-related operations.
 *
 * @module StorageModule
 */
@Module({
  controllers: [StorageController],
  providers: [
    {
      provide: STORAGE_SERVICE,
      useClass: S3StorageService,
    },
  ],
})
export class StorageModule {}
