import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { ProgramController } from './controllers/program.controller';
import { ProgramService } from './services/program.service';
import { PROGRAM_REPOSITORY } from './tokens';
import { TypeormProgramsRepository } from './repositories/typeorm-programs.repository';
import { FacultiesModule } from '../faculties/faculties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Program]),
    FacultiesModule,
  ],
  controllers: [ProgramController],
  providers: [
    ProgramService,
    {
      provide: PROGRAM_REPOSITORY,
      useClass: TypeormProgramsRepository,
    },
  ],
})
export class ProgramsModule {}