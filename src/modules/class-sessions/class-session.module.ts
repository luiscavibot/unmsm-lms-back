import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSession } from './entities/class-session.entity';
import { ClassSessionController } from './controllers/class-session.controller';
import { ClassSessionService } from './services/class-session.service';
import { TypeormClassSessionsRepository } from './repositories/typeorm-class-sessions.repository';
import { CLASS_SESSION_REPOSITORY } from './tokens';
import { CourseOfferingModule } from '../course-offerings/course-offering.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassSession]),
    CourseOfferingModule,
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
