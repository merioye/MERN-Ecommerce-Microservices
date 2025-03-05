import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TFileEvent } from '@ecohatch/types-shared';
import {
  BaseMongooseService,
  ConflictError,
  ILogger,
  LOGGER,
  NotFoundError,
  VERSION_COLUMN,
} from '@ecohatch/utils-api';
import { FileEventStatus, FileEventType } from '@ecohatch/utils-shared';
import { Model } from 'mongoose';

import { FileEventDocument } from '@/database';

import { FILE_SERVICE } from '../constants';
import { IFileService } from '../interfaces';

/**
 * Service class for managing file events
 * @class FileEventService
 * @extends BaseMongooseService<TFileEvent>
 */
@Injectable()
export class FileEventService extends BaseMongooseService<TFileEvent> {
  public constructor(
    @InjectModel(FileEventDocument.name) fileEventModel: Model<TFileEvent>,
    @Inject(FILE_SERVICE) private readonly _fileService: IFileService,
    @Inject(LOGGER) private readonly _logger: ILogger
  ) {
    super(fileEventModel);
  }

  public async handleFileEvent(
    eventId: string,
    filePath: string,
    type: FileEventType
  ): Promise<TFileEvent> {
    const session = await this.startSession();

    let event: TFileEvent | null = null;
    try {
      // Check for existing event processing
      event = await this.findOne({
        filter: { eventId },
        session,
      });
      if (event) {
        if (event.status === FileEventStatus.COMPLETED) {
          await this.commitSession(session);
          return event;
        }
        throw new ConflictError(
          `File Event processing in progress: ${eventId}`
        );
      }

      // Create new event record
      event = await this.create(
        {
          eventId,
          filePath,
          type,
          status: FileEventStatus.PROCESSING,
          result: {},
        },
        null,
        {
          session,
        }
      );

      // Process event
      const delta = type === FileEventType.REFERENCE ? 1 : -1;
      const file = await this._fileService.findOne({
        filter: { filePath },
        session,
      });

      if (!file)
        throw new NotFoundError(
          `File not found in processing file event: ${eventId}`
        );

      const currentVersion = file[VERSION_COLUMN];
      const updatedFile = await this._fileService.updateFileReferenceCount(
        file._id,
        delta,
        currentVersion,
        session
      );
      if (!updatedFile) {
        throw new ConflictError(
          `Concurrent modification detected in processing file event: ${eventId}`
        );
      }

      // Update event status
      await this.update(
        { _id: event._id },
        { status: [FileEventStatus.COMPLETED], result: updatedFile },
        null,
        { session }
      );

      await this.commitSession(session);
      return event;
    } catch (error) {
      await this.rollbackSession(session);
      this._logger.error(
        `File event processing failed for event ID: ${eventId}: ${error instanceof Error ? error.message : JSON.stringify(error)}`
      );

      if (event) {
        await this.update(
          { _id: event._id },
          { status: FileEventStatus.FAILED },
          null,
          { session }
        );
      }

      throw error;
    }
  }
}
