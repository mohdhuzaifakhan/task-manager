import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus, TaskPriority } from '../tasks/task.schema';
import { Project, ProjectDocument } from '../projects/project.schema';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private activityService: ActivityService,
  ) {}

  async getDashboard(userId: string, userRole: string) {
    const now = new Date();

    // Get projects user has access to
    const projects = await this.projectModel.find({
      $or: [
        { createdBy: new Types.ObjectId(userId) },
        { members: new Types.ObjectId(userId) },
      ],
    });

    const projectIds = projects.map((p) => (p as any)._id);

    const taskFilter = userRole === 'ADMIN'
      ? { projectId: { $in: projectIds } }
      : {
          projectId: { $in: projectIds },
          $or: [
            { assignedTo: new Types.ObjectId(userId) },
            { createdBy: new Types.ObjectId(userId) },
          ],
        };

    const allTasks = await this.taskModel.find(taskFilter).exec();

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === TaskStatus.DONE).length;
    const overdueTasks = allTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== TaskStatus.DONE,
    ).length;
    const myTasks = allTasks.filter(
      (t) => t.assignedTo && t.assignedTo.toString() === userId,
    ).length;

    const tasksByStatus = {
      todo: allTasks.filter((t) => t.status === TaskStatus.TODO).length,
      inProgress: allTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      done: allTasks.filter((t) => t.status === TaskStatus.DONE).length,
    };

    const tasksByPriority = {
      low: allTasks.filter((t) => t.priority === TaskPriority.LOW).length,
      medium: allTasks.filter((t) => t.priority === TaskPriority.MEDIUM).length,
      high: allTasks.filter((t) => t.priority === TaskPriority.HIGH).length,
    };

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const recentActivity = await this.activityService.findRecent(10);

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      myTasks,
      totalProjects: projects.length,
      tasksByStatus,
      tasksByPriority,
      completionRate,
      recentActivity,
    };
  }
}
