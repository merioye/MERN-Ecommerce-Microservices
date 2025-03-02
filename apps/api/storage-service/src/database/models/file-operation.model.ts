import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FileOperationStatus } from '@ecohatch/utils-shared';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'tbl_file_operations',
})
export class FileOperation extends Document {
  @Prop({ required: true, unique: true })
  operationId!: string; // Unique ID from client/event

  @Prop({ required: true })
  fileUrl!: string;

  @Prop({
    required: true,
    enum: FileOperationStatus,
    default: FileOperationStatus.PROCESSING,
  })
  status!: FileOperationStatus;

  @Prop({ default: 0 })
  version!: number;

  @Prop({ type: Object })
  result!: Record<string, any>;
}

export const FileOperationSchema = SchemaFactory.createForClass(FileOperation);
