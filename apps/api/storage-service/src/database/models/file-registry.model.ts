import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FileRegistryStatus } from '@ecohatch/utils-shared';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'tbl_file_registries',
})
export class FileRegistry extends Document {
  @Prop({ required: true, unique: true, index: true })
  fileUrl!: string;

  @Prop({ required: true, index: true })
  ownerId!: string;

  @Prop({ default: 0 })
  referenceCount!: number;

  @Prop({
    enum: FileRegistryStatus,
    default: FileRegistryStatus.PENDING,
  })
  status!: FileRegistryStatus;

  @Prop({ default: 0 })
  version!: number;

  @Prop()
  lastReferencedAt!: Date;
}

export const FileRegistrySchema = SchemaFactory.createForClass(FileRegistry);
