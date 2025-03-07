import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseController } from './controllers/course.controller';
import { CourseService } from './services/course.service';
import { TypeormCoursesRepository } from './repositories/typeorm-courses.repository';
import { COURSE_REPOSITORY } from './tokens';

@Module({
  imports: [TypeOrmModule.forFeature([Course])],
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
