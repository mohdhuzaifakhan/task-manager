import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './project.schema';
import { CreateProjectDto, UpdateProjectDto, AddMembersDto } from './dto/project.dto';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction, ActivityEntityType } from '../activity/activity.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private activityService: ActivityService,
  ) {}

  async create(dto: CreateProjectDto, userId: string): Promise<ProjectDocument> {
    const project = new this.projectModel({
      ...dto,
      createdBy: new Types.ObjectId(userId),
      members: [new Types.ObjectId(userId)],
    });
    const saved = await project.save();

    await this.activityService.log({
      userId,
      action: ActivityAction.CREATED_PROJECT,
      entityId: (saved as any)._id.toString(),
      entityType: ActivityEntityType.PROJECT,
      metadata: { projectName: saved.name },
    });

    return saved.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);
  }

  async findAll(userId: string): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({
        $or: [
          { createdBy: new Types.ObjectId(userId) },
          { members: new Types.ObjectId(userId) },
        ],
      })
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .exec();

    if (!project) throw new NotFoundException('Project not found');

    const isMember = project.members.some(
      (m: any) => m._id.toString() === userId,
    );
    const isCreator = project.createdBy && (project.createdBy as any)._id
      ? (project.createdBy as any)._id.toString() === userId
      : project.createdBy.toString() === userId;

    if (!isMember && !isCreator) {
      throw new ForbiddenException('Access denied to this project');
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    if (project.createdBy.toString() !== userId) {
      throw new ForbiddenException('Only project creator can update it');
    }

    Object.assign(project, dto);
    const updated = await project.save();
    return updated.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);
  }

  async delete(id: string, userId: string): Promise<void> {
    const project = await this.projectModel.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    if (project.createdBy.toString() !== userId) {
      throw new ForbiddenException('Only project creator can delete it');
    }
    await this.projectModel.findByIdAndDelete(id);
  }

  async addMembers(id: string, dto: AddMembersDto, userId: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    if (project.createdBy.toString() !== userId) {
      throw new ForbiddenException('Only project creator can add members');
    }

    const newMembers = dto.memberIds
      .map((mid) => new Types.ObjectId(mid))
      .filter((mid) => !project.members.some((m) => m.toString() === mid.toString()));

    project.members.push(...newMembers);
    const updated = await project.save();

    await this.activityService.log({
      userId,
      action: ActivityAction.ADDED_MEMBER,
      entityId: id,
      entityType: ActivityEntityType.PROJECT,
      metadata: { projectName: project.name, count: newMembers.length },
    });

    return updated.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);
  }

  async removeMember(projectId: string, memberId: string, userId: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');
    if (project.createdBy.toString() !== userId) {
      throw new ForbiddenException('Only project creator can remove members');
    }

    project.members = project.members.filter(
      (m) => m.toString() !== memberId,
    ) as any;
    const updated = await project.save();
    return updated.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);
  }
}
