import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from './entities/semester.entity';
import { SemesterController } from './controllers/semester.controller';
import { SemesterService } from './services/semester.service';
import { SEMESTER_REPOSITORY } from './tokens';
import { TypeormSemestersRepository } from './repositories/typeorm-semesters.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Semester])],
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