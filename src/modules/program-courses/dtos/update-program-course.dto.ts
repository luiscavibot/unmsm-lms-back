import { PartialType } from '@nestjs/swagger';
import { CreateProgramCourseDto } from './create-program-course.dto';

export class UpdateProgramCourseDto extends PartialType(CreateProgramCourseDto) {}
