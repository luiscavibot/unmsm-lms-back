import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentController } from './controllers/enrollment.controller';
import { EnrollmentService } from './services/enrollment.service';
import { TypeormEnrollmentsRepository } from './repositories/typeorm-enrollments.repository';
import { ENROLLMENT_REPOSITORY } from './tokens';
import { UsersModule } from '../users/users.module';
import { CourseOfferingModule } from '../course-offerings/course-offering.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    UsersModule,
    CourseOfferingModule,
  ],
  controllers: [EnrollmentController],
  providers: [
    EnrollmentService,
    {
      provide: ENROLLMENT_REPOSITORY,
      useClass: TypeormEnrollmentsRepository,
    },
  ],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
