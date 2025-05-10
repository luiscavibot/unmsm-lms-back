import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockAssignment } from './entities/block-assignment.entity';
import { BlockAssignmentController } from './controllers/block-assignment.controller';
import { BlockAssignmentService } from './services/block-assignment.service';
import { BLOCK_ASSIGNMENT_REPOSITORY } from './tokens';
import { TypeormBlockAssignmentsRepository } from './repositories/typeorm-block-assignments.repository';
import { UsersModule } from '../users/users.module';
import { CourseOfferingModule } from '../course-offerings/course-offering.module';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlockAssignment]),
    UsersModule,
    BlocksModule,
    CourseOfferingModule
  ],
  controllers: [BlockAssignmentController],
  providers: [
    BlockAssignmentService,
    {
      provide: BLOCK_ASSIGNMENT_REPOSITORY,
      useClass: TypeormBlockAssignmentsRepository,
    },
  ],
  exports: [BlockAssignmentService, BLOCK_ASSIGNMENT_REPOSITORY],
})
export class BlockAssignmentsModule {}