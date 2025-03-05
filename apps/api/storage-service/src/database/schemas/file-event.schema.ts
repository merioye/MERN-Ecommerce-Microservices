import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FileEventStatus, FileEventType } from '@ecohatch/utils-shared';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'tbl_file_events',
})
export class FileEventDocument extends Document {
  @Prop({ required: true, unique: true, index: true })
  eventId!: string; // Unique ID from client/event

  @Prop({ required: true })
  filePath!: string;

  @Prop({ required: true, enum: FileEventType })
  type!: FileEventType;

  @Prop({
    required: true,
    enum: FileEventStatus,
    default: FileEventStatus.PROCESSING,
  })
  status!: FileEventStatus;

  @Prop({ default: 0, min: 0 })
  version!: number;

  @Prop({ type: Object })
  result!: Record<string, any>;
}

export const FileEventSchema = SchemaFactory.createForClass(FileEventDocument);
