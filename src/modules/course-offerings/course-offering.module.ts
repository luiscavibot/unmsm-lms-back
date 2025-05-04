import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseOffering } from './entities/course-offering.entity';
import { CourseOfferingController } from './controllers/course-offering.controller';
import { CourseOfferingService } from './services/course-offering.service';
import { TypeormCourseOfferingsRepository } from './repositories/typeorm-course-offerings.repository';
import { COURSE_OFFERING_REPOSITORY } from './tokens';
import { ProgramsModule } from '../programs/programs.module';
import { CourseModule } from '../courses/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseOffering]),
    ProgramsModule,
    CourseModule,
  ],
  controllers: [CourseOfferingController],
  providers: [
    CourseOfferingService,
    {
      provide: COURSE_OFFERING_REPOSITORY,
      useClass: TypeormCourseOfferingsRepository,
    },
  ],
  exports: [CourseOfferingService],
})
export class CourseOfferingModule {}