import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FileStatus } from '@ecohatch/utils-shared';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'tbl_files',
})
export class FileDocument extends Document {
  @Prop({ required: true, unique: true, index: true })
  filePath!: string;

  @Prop({ required: true, index: true })
  ownerId!: string;

  @Prop({ default: 0, min: 0 })
  referenceCount!: number;

  @Prop({
    enum: FileStatus,
    default: FileStatus.PENDING,
  })
  status!: FileStatus;

  @Prop({ default: 0, min: 0 })
  version!: number;

  @Prop()
  lastReferencedAt!: Date;
}

export const FileSchema = SchemaFactory.createForClass(FileDocument);
