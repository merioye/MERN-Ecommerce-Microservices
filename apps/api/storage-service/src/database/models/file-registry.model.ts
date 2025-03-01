import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FileRegistryStatus } from '@ecohatch/utils-shared';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'tbl_file_registry',
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
export class FileRegistry extends Document {
  @Prop({ required: true })
  fileUrl!: string;

  @Prop({ required: true })
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
