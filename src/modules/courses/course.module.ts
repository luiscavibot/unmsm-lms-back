import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseController } from './controllers/course.controller';
import { CourseService } from './services/course.service';
import { TypeormCoursesRepository } from './repositories/typeorm-courses.repository';
import { COURSE_REPOSITORY } from './tokens';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { BlockAssignment } from '../block-assignments/entities/block-assignment.entity';
import { Block } from '../blocks/entities/block.entity';
import { CourseOffering } from '../course-offerings/entities/course-offering.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course, 
      Enrollment, 
      BlockAssignment, 
      Block, 
      CourseOffering,
    ]),
    forwardRef(() => UsersModule)
  ],
  controllers: [CourseController],
  providers: [
    CourseService,
    {
      provide: COURSE_REPOSITORY,
      useClass: TypeormCoursesRepository,
    },
  ],
  exports: [CourseService],
})
export class CourseModule {}
