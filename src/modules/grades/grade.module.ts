import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { GradeController } from './controllers/grade.controller';
import { GradeService } from './services/grade.service';
import { TypeormGradesRepository } from './repositories/typeorm-grades.repository';
import { GRADE_REPOSITORY } from './tokens';
import { EnrollmentModule } from '../enrollments/enrollment.module';
import { EvaluationsModule } from '../evaluations/evaluations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grade]),
    EnrollmentModule,
    EvaluationsModule
  ],
  controllers: [GradeController],
  providers: [
    GradeService,
    {
      provide: GRADE_REPOSITORY,
      useClass: TypeormGradesRepository,
    },
  ],
  exports: [GradeService, GRADE_REPOSITORY],
})
export class GradeModule {}