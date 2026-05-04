import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivityService } from './activity.service';

@Controller('activity')
@UseGuards(AuthGuard('jwt'))
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  findRecent(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.activityService.findRecent(50, startDate, endDate);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.activityService.findByProject(projectId, 20);
  }
}
