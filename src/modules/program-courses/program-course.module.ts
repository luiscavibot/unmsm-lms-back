import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramCourse } from './entities/program-course.entity';
import { ProgramCourseController } from './controllers/program-course.controller';
import { ProgramCourseService } from './services/program-course.service';
import { TypeormProgramCoursesRepository } from './repositories/typeorm-program-courses.repository';
import { PROGRAM_COURSE_REPOSITORY } from './tokens';
import { ProgramsModule } from '../programs/programs.module';
import { CourseModule } from '../courses/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProgramCourse]),
    ProgramsModule,
    CourseModule,
],
  controllers: [ProgramCourseController],
  providers: [
    ProgramCourseService,
    {
      provide: PROGRAM_COURSE_REPOSITORY,
      useClass: TypeormProgramCoursesRepository,
    },
  ],
  exports: [ProgramCourseService],
})
export class ProgramCourseModule {}
