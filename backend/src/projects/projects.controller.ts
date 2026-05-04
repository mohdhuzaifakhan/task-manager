import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddMembersDto } from './dto/project.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.create(dto, user._id.toString());
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.projectsService.findAll(user._id.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.findById(id, user._id.toString());
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.update(id, dto, user._id.toString());
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.delete(id, user._id.toString());
  }

  @Post(':id/members')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  addMembers(
    @Param('id') id: string,
    @Body() dto: AddMembersDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.addMembers(id, dto, user._id.toString());
  }

  @Delete(':id/members/:memberId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.removeMember(id, memberId, user._id.toString());
  }
}
