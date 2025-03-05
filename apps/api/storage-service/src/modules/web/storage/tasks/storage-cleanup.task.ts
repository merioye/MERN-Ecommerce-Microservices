import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TFile } from '@ecohatch/types-shared';
import {
  CronJobTaskContext,
  ICronJobTask,
  ILogger,
  LOGGER,
} from '@ecohatch/utils-api';
import { FileStatus } from '@ecohatch/utils-shared';

import { Config } from '@/enums';

import {
  DISTRIBUTED_LOCK_SERVICE,
  FILE_SERVICE,
  STORAGE_PROVIDER,
} from '../constants';
import {
  IDistributedLockService,
  IFileService,
  IStorageProvider,
} from '../interfaces';
import { StorageCleanupTaskContext } from '../types';

/**
 * Service class for performing periodic file cleanup tasks.
 * This service removes orphaned and expired files from the storage system.
 *
 * @class StorageCleanupTask
 * @implements {ICronJobTask<StorageCleanupTaskContext>}
 */
@Injectable()
export class StorageCleanupTask
  implements ICronJobTask<StorageCleanupTaskContext>
{
  private readonly _defaultRetentionDays = 30;

  public constructor(
    @Inject(DISTRIBUTED_LOCK_SERVICE)
    private readonly _distributedLockService: IDistributedLockService,
    @Inject(FILE_SERVICE) private readonly _fileService: IFileService,
    @Inject(STORAGE_PROVIDER)
    private readonly _storageProvider: IStorageProvider,
    @Inject(LOGGER) private readonly _logger: ILogger,
    private readonly _configService: ConfigService
  ) {}

  /**
   * Executes the file cleanup task.
   *
   * This method acquires a distributed lock to ensure that only one instance of the task runs at a time.
   * It then identifies orphaned or expired files based on retention policies and deletes them in batches.
   *
   * @param context - Context containing task execution parameters.
   * @returns Promise that resolves when the task completes.
   */
  public async execute(
    context: CronJobTaskContext<StorageCleanupTaskContext>
  ): Promise<void> {
    const LOCK_NAME = 'file-cleanup-job-lock';
    const LOCK_TTL = this._configService.get<number>(Config.LOCK_TTL)!;

    const isLockExists = await this._distributedLockService.findOne({
      filter: { name: LOCK_NAME },
    });
    if (isLockExists) {
      this._logger.info(
        'File cleanup job already in progress by another instance'
      );
      return;
    }

    // Acquire distributed lock
    const lock = await this._distributedLockService.create({
      name: LOCK_NAME,
      expiresAt: new Date(Date.now() + LOCK_TTL),
    });

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(
        cutoffDate.getDate() -
          (context?.params?.RETENTION_DAYS ?? this._defaultRetentionDays)
      );
      const createdBefore = 86400000; // 24 hours in milliseconds

      const files = await this._fileService.findMany({
        filter: {
          $or: [
            {
              status: FileStatus.ACTIVE,
              referenceCount: 0,
              lastReferencedAt: { $lt: cutoffDate },
            },
            {
              status: FileStatus.PENDING,
              referenceCount: 0,
              createdAt: { $lt: new Date(Date.now() - createdBefore) },
            },
          ],
        },
      });

      this._logger.info(`Found ${files.length} files to cleanup`);

      await this.deleteFilesBatch(files);
    } catch (error) {
      this._logger.error(
        `Cleanup job failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`
      );
    } finally {
      await this._distributedLockService.delete({ _id: lock._id });
    }
  }

  /**
   * Handles errors that occur during task execution.
   * Logs the error and optionally retries the task execution.
   *
   * @param error - The error that occurred.
   * @param context - The execution context of the job.
   * @returns {void}
   */
  public async onError?(
    error: Error,
    context: CronJobTaskContext<StorageCleanupTaskContext>
  ): Promise<void> {
    // 1. Log the error with context
    this._logger.error({
      message: `Job ${context.jobName} failed`,
      error: error.stack,
      params: context.params,
      timestamp: context.timestamp,
    });

    // 2. Implement retry logic
    await this.retryMechanism(context);
  }

  /**
   * Implements a retry mechanism with a delay.
   *
   * @param context - The execution context of the job.
   * @returns Promise that resolves after retry delay.
   */
  private async retryMechanism(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: CronJobTaskContext<StorageCleanupTaskContext>
  ): Promise<void> {
    // 2. Retry the job
    return new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  /**
   * Deletes files in batches from both storage and database.
   *
   * @param files - Array of files to delete.
   * @param batchSize - Number of files processed in each batch.
   * @returns {void}
   */
  private async deleteFilesBatch(
    files: TFile[],
    batchSize = 50
  ): Promise<void> {
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const session = await this._fileService.startSession();

      try {
        // Get fresh data for the entire batch
        const fileIds = batch.map((file) => file._id);
        const freshFiles = await this._fileService.findMany({
          filter: { _id: { $in: fileIds } },
          project: { _id: 1, filePath: 1, referenceCount: 1 },
          session,
        });

        // Filter files eligible for deletion
        const eligibleFiles = freshFiles.filter(
          (file) => file && file.referenceCount === 0
        );

        if (eligibleFiles.length === 0) {
          await this._fileService.commitSession(session);
          continue;
        }

        // Delete from storage in parallel
        await Promise.all(
          eligibleFiles.map((file) =>
            this._storageProvider.deleteFile(file.filePath)
          )
        );

        // Delete from database in one operation
        await this._fileService.delete({
          filter: { _id: { $in: eligibleFiles.map((file) => file._id) } },
          session,
        });

        await this._fileService.commitSession(session);
      } catch (error) {
        await this._fileService.rollbackSession(session);
        throw error;
      }
    }
  }
}
