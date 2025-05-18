import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationController } from './controllers/evaluation.controller';
import { EvaluationService } from './services/evaluation.service';
import { EVALUATION_REPOSITORY } from './tokens/index';
import { TypeormEvaluationsRepository } from './repositories/typeorm-evaluations.repository';
import { BlocksModule } from '../blocks/blocks.module';
import { EnrollmentModule } from '../enrollments/enrollment.module';
import { Grade } from '../grades/entities/grade.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { EnrollmentBlock } from '../enrollment-blocks/entities/enrollment-block.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evaluation, Grade, Enrollment, EnrollmentBlock]),
    BlocksModule,
    EnrollmentModule
  ],
  controllers: [EvaluationController],
  providers: [
    EvaluationService,
    {
      provide: EVALUATION_REPOSITORY,
      useClass: TypeormEvaluationsRepository,
    },
  ],
  exports: [EvaluationService, EVALUATION_REPOSITORY],
})
export class EvaluationsModule {}