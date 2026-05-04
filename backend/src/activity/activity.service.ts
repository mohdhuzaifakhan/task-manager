import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument, ActivityAction, ActivityEntityType } from './activity.schema';

interface LogActivityDto {
  userId: string;
  action: ActivityAction;
  entityId: string;
  entityType: ActivityEntityType;
  metadata?: Record<string, any>;
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async log(dto: LogActivityDto): Promise<void> {
    try {
      await this.activityModel.create({
        userId: new Types.ObjectId(dto.userId),
        action: dto.action,
        entityId: new Types.ObjectId(dto.entityId),
        entityType: dto.entityType,
        metadata: dto.metadata || {},
        timestamp: new Date(),
      });
    } catch (err) {
      // Never let activity logging crash the main flow
      console.error('Activity log error:', err);
    }
  }

  async findByProject(projectId: string, limit = 20) {
    return this.activityModel
      .find({ entityId: new Types.ObjectId(projectId), entityType: 'PROJECT' })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async findRecent(limit = 30, startDate?: string, endDate?: string) {
    const filter: any = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    return this.activityModel
      .find(filter)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async findByUser(userId: string, limit = 20) {
    return this.activityModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}
