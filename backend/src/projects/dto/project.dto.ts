import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { ProjectStatus } from '../project.schema';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
}

export class AddMembersDto {
  @IsArray()
  @IsMongoId({ each: true })
  memberIds: string[];
}

export class RemoveMemberDto {
  @IsMongoId()
  memberId: string;
}
