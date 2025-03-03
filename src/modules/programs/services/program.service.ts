import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Program } from '../entities/program.entity';
import { CreateProgramDto } from '../dtos/create-program.dto';
import { UpdateProgramDto } from '../dtos/update-program.dto';
import { PROGRAM_REPOSITORY } from '../tokens';
import { IProgramRepository } from '../interfaces/program.repository.interface';
import { FacultyService } from '../../faculties/services/faculty.service';
import { FACULTY_REPOSITORY } from 'src/modules/faculties/tokens';

@Injectable()
export class ProgramService {
  constructor(
    @Inject(PROGRAM_REPOSITORY)
    private readonly programRepository: IProgramRepository,
    @Inject(FACULTY_REPOSITORY)
    private readonly facultyService: FacultyService,
  ) {}

  async create(createProgramDto: CreateProgramDto): Promise<Program> {
    await this.facultyService.findOne(createProgramDto.facultyId);
    return await this.programRepository.create(createProgramDto);
  }

  async findAll(): Promise<Program[]> {
    return await this.programRepository.findAll();
  }

  async findOne(id: string): Promise<Program> {
    const program = await this.programRepository.findOne(id);
    if (!program) {
      throw new NotFoundException(`Programa con id ${id} no encontrado`);
    }
    return program;
  }

  async update(id: string, updateProgramDto: UpdateProgramDto): Promise<Program | null> {
    const program = await this.findOne(id);
    if (updateProgramDto.facultyId) {
      await this.facultyService.findOne(updateProgramDto.facultyId);
    }
    return this.programRepository.update(program.id, updateProgramDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    return this.programRepository.delete(id);
  }
}