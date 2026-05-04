import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TasksModule } from '../tasks/tasks.module';
import { ProjectsModule } from '../projects/projects.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [TasksModule, ProjectsModule, ActivityModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
