import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSession } from './entities/class-session.entity';
import { ClassSessionController } from './controllers/class-session.controller';
import { ClassSessionService } from './services/class-session.service';
import { TypeormClassSessionsRepository } from './repositories/typeorm-class-sessions.repository';
import { CLASS_SESSION_REPOSITORY } from './tokens';
import { BlocksModule } from '../blocks/blocks.module';
import { WeeksModule } from '../weeks/weeks.module';
import { BlockAssignmentsModule } from '../block-assignments/block-assignments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassSession]),
    BlocksModule,
    WeeksModule,
    BlockAssignmentsModule,
  ],
  controllers: [ClassSessionController],
  providers: [
    ClassSessionService,
    {
      provide: CLASS_SESSION_REPOSITORY,
      useClass: TypeormClassSessionsRepository,
    },
  ],
  exports: [ClassSessionService],
})
export class ClassSessionModule {}
