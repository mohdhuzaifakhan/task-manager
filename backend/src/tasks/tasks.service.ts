import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from './task.schema';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from './dto/task.dto';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction, ActivityEntityType } from '../activity/activity.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private activityService: ActivityService,
  ) {}

  async create(dto: CreateTaskDto, userId: string): Promise<TaskDocument> {
    const task = new this.taskModel({
      ...dto,
      projectId: new Types.ObjectId(dto.projectId),
      assignedTo: dto.assignedTo ? new Types.ObjectId(dto.assignedTo) : null,
      createdBy: new Types.ObjectId(userId),
    });
    const saved = await task.save();

    await this.activityService.log({
      userId,
      action: dto.assignedTo ? ActivityAction.ASSIGNED_TASK : ActivityAction.CREATED_TASK,
      entityId: (saved as any)._id.toString(),
      entityType: ActivityEntityType.TASK,
      metadata: { taskTitle: saved.title },
    });

    return saved.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);
  }

  async findAll(filterDto: TaskFilterDto, userId: string, userRole: string): Promise<TaskDocument[]> {
    const filter: any = {};

    if (filterDto.projectId) {
      filter.projectId = new Types.ObjectId(filterDto.projectId);
    }
    if (filterDto.status) filter.status = filterDto.status;
    if (filterDto.priority) filter.priority = filterDto.priority;
    if (filterDto.assignedTo) {
      filter.assignedTo = new Types.ObjectId(filterDto.assignedTo);
    }
    if (filterDto.search) {
      filter.$or = [
        { title: { $regex: filterDto.search, $options: 'i' } },
        { description: { $regex: filterDto.search, $options: 'i' } },
      ];
    }

    // Members can only see tasks in their projects or assigned to them
    if (userRole !== 'ADMIN') {
      filter.$or = [
        ...(filter.$or || []),
        { assignedTo: new Types.ObjectId(userId) },
        { createdBy: new Types.ObjectId(userId) },
      ];
    }

    const sort: any = {};
    if (filterDto.sortBy) {
      const [field, order] = filterDto.sortBy.split(':');
      sort[field] = order === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    return this.taskModel
      .find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .sort(sort)
      .exec();
  }

  async findById(id: string): Promise<TaskDocument> {
    const task = await this.taskModel
      .findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, userId: string, userRole: string): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Task not found');

    // Members can only update tasks assigned to them
    if (userRole !== 'ADMIN') {
      const isAssigned = task.assignedTo && task.assignedTo.toString() === userId;
      if (!isAssigned) {
        throw new ForbiddenException('You can only update tasks assigned to you');
      }
    }

    const prevStatus = task.status;
    
    const updateData = { ...dto };
    if (dto.assignedTo) {
      updateData.assignedTo = new Types.ObjectId(dto.assignedTo) as any;
    }

    const updated = await this.taskModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate([
        { path: 'assignedTo', select: 'name email' },
        { path: 'createdBy', select: 'name email' },
        { path: 'projectId', select: 'name' },
      ])
      .exec();

    if (!updated) throw new NotFoundException('Task not found');
    
    // Log completion or update
    if (dto.status === TaskStatus.DONE && prevStatus !== TaskStatus.DONE) {
      await this.activityService.log({
        userId,
        action: ActivityAction.COMPLETED_TASK,
        entityId: id,
        entityType: ActivityEntityType.TASK,
        metadata: { taskTitle: updated.title },
      });
    } else if (dto.assignedTo) {
      await this.activityService.log({
        userId,
        action: ActivityAction.ASSIGNED_TASK,
        entityId: id,
        entityType: ActivityEntityType.TASK,
        metadata: { taskTitle: updated.title },
      });
    } else {
      await this.activityService.log({
        userId,
        action: ActivityAction.UPDATED_TASK,
        entityId: id,
        entityType: ActivityEntityType.TASK,
        metadata: { taskTitle: updated.title },
      });
    }

    return updated;
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Task not found');

    if (userRole !== 'ADMIN' && task.createdBy.toString() !== userId) {
      throw new ForbiddenException('Only admins or task creators can delete tasks');
    }

    await this.activityService.log({
      userId,
      action: ActivityAction.DELETED_TASK,
      entityId: id,
      entityType: ActivityEntityType.TASK,
      metadata: { taskTitle: task.title },
    });

    await this.taskModel.findByIdAndDelete(id);
  }

  async getTasksByProject(projectId: string): Promise<TaskDocument[]> {
    return this.taskModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }
}
