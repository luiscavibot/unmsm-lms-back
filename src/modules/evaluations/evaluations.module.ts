import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationController } from './controllers/evaluation.controller';
import { EvaluationService } from './services/evaluation.service';
import { EVALUATION_REPOSITORY } from './tokens/index';
import { TypeormEvaluationsRepository } from './repositories/typeorm-evaluations.repository';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evaluation]),
    BlocksModule
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