import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;

export enum ActivityAction {
  CREATED_TASK = 'CREATED_TASK',
  UPDATED_TASK = 'UPDATED_TASK',
  ASSIGNED_TASK = 'ASSIGNED_TASK',
  COMPLETED_TASK = 'COMPLETED_TASK',
  DELETED_TASK = 'DELETED_TASK',
  CREATED_PROJECT = 'CREATED_PROJECT',
  UPDATED_PROJECT = 'UPDATED_PROJECT',
  ADDED_MEMBER = 'ADDED_MEMBER',
  REMOVED_MEMBER = 'REMOVED_MEMBER',
}

export enum ActivityEntityType {
  TASK = 'TASK',
  PROJECT = 'PROJECT',
}

@Schema({ timestamps: false })
export class Activity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: ActivityAction, required: true })
  action: ActivityAction;

  @Prop({ type: Types.ObjectId, required: true })
  entityId: Types.ObjectId;

  @Prop({ type: String, enum: ActivityEntityType, required: true })
  entityType: ActivityEntityType;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ default: () => new Date() })
  timestamp: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
ActivitySchema.index({ entityId: 1, timestamp: -1 });
ActivitySchema.index({ userId: 1, timestamp: -1 });
