import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from './entities/semester.entity';
import { SemesterController } from './controllers/semester.controller';
import { SemesterService } from './services/semester.service';
import { SEMESTER_REPOSITORY } from './tokens';
import { TypeormSemestersRepository } from './repositories/typeorm-semesters.repository';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { BlockAssignment } from '../block-assignments/entities/block-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Semester, Enrollment, BlockAssignment])],
  controllers: [SemesterController],
  providers: [
    SemesterService,
    {
      provide: SEMESTER_REPOSITORY,
      useClass: TypeormSemestersRepository,
    },
  ],
  exports: [SemesterService],
})
export class SemestersModule {}