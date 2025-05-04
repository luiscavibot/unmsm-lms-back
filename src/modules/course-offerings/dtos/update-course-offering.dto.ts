import { PartialType } from '@nestjs/swagger';
import { CreateCourseOfferingDto } from './create-course-offering.dto';

export class UpdateCourseOfferingDto extends PartialType(CreateCourseOfferingDto) {}