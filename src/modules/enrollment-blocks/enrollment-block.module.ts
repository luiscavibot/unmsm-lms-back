import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentBlock } from './entities/enrollment-block.entity';
import { EnrollmentBlockController } from './controllers/enrollment-block.controller';
import { EnrollmentBlockService } from './services/enrollment-block.service';
import { TypeormEnrollmentBlocksRepository } from './repositories/typeorm-enrollment-blocks.repository';
import { ENROLLMENT_BLOCK_REPOSITORY } from './tokens';
import { EnrollmentModule } from '../enrollments/enrollment.module';
import { BlocksModule } from '../blocks/blocks.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { ClassSessionModule } from '../class-sessions/class-session.module';
import { UsersModule } from '../users/users.module';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { ClassSession } from '../class-sessions/entities/class-session.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Evaluation } from '../evaluations/entities/evaluation.entity';
import { Block } from '../blocks/entities/block.entity';
import { FindEnrolledStudentsQuery } from './queries/find-enrolled-students.query';
import { FindEnrolledStudentsGradesQuery } from './queries/find-enrolled-students-grades.query';
import { FindStudentScoresQuery } from './queries/find-student-scores.query';
import { BlockAssignmentsModule } from '../block-assignments/block-assignments.module';
import { EvaluationsModule } from '../evaluations/evaluations.module';
import { CourseOfferingModule } from '../course-offerings/course-offering.module';
import { CourseModule } from '../courses/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnrollmentBlock, Enrollment, Attendance, ClassSession, Grade, Evaluation, Block]),
    EnrollmentModule,
    BlocksModule,
    AttendanceModule,
    ClassSessionModule,
    UsersModule,
    BlockAssignmentsModule,
    EvaluationsModule,
    CourseOfferingModule,
    CourseModule,
  ],
  controllers: [EnrollmentBlockController],
  providers: [
    EnrollmentBlockService,
    {
      provide: ENROLLMENT_BLOCK_REPOSITORY,
      useClass: TypeormEnrollmentBlocksRepository,
    },
    FindEnrolledStudentsQuery,
    FindStudentScoresQuery,
    FindEnrolledStudentsGradesQuery,
  ],
  exports: [EnrollmentBlockService],
})
export class EnrollmentBlockModule {}