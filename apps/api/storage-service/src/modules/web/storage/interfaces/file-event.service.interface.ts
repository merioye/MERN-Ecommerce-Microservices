import { TFileEvent } from '@ecohatch/types-shared';
import { BaseMongooseService } from '@ecohatch/utils-api';
import { FileEventType } from '@ecohatch/utils-shared';

/**
 * Interface defining the contract for the FileEventService
 *
 * @interface IFileEventService
 * @extends BaseMongooseService<TFileEvent>
 */
export interface IFileEventService extends BaseMongooseService<TFileEvent> {
  handleFileEvent(
    eventId: string,
    filePath: string,
    type: FileEventType
  ): Promise<TFileEvent>;
}
