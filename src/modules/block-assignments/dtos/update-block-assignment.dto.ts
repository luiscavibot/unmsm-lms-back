import { PartialType } from '@nestjs/swagger';
import { CreateBlockAssignmentDto } from './create-block-assignment.dto';

export class UpdateBlockAssignmentDto extends PartialType(CreateBlockAssignmentDto) {}