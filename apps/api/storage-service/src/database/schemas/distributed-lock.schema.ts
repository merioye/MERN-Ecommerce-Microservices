import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'tbl_distributed_locks',
})
export class DistributedLockDocument extends Document {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true })
  expiresAt!: Date;
}

export const DistributedLockSchema = SchemaFactory.createForClass(
  DistributedLockDocument
);

DistributedLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
