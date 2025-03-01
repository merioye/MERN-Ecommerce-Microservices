import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FileOperationStatus } from '@ecohatch/utils-shared';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'tbl_file_operations',
  toObject: {
    transform(_, ret) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ret.id = ret._id;
      delete ret._id;
    },
  },
  toJSON: {
    transform(_, ret) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class FileOperation extends Document {
  @Prop({ required: true, unique: true })
  operationId!: string;

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
