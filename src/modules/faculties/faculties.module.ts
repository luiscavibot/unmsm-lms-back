import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './entities/faculty.entity';
import { FacultyController } from './controllers/faculty.controller';
import { FacultyService } from './services/faculty.service';
import { FACULTY_REPOSITORY } from './tokens';
import { TypeormFacultiesRepository } from './repositories/typeorm-faculties.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Faculty])],
  controllers: [FacultyController],
  providers: [
    FacultyService,
    {
      provide: FACULTY_REPOSITORY,
      useClass: TypeormFacultiesRepository,
    },
  ],
  exports: [FacultyService, FACULTY_REPOSITORY],
})
export class FacultiesModule {}
