import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Semester } from '../entities/semester.entity';
import { CreateSemesterDto } from '../dtos/create-semester.dto';
import { UpdateSemesterDto } from '../dtos/update-semester.dto';
import { SEMESTER_REPOSITORY } from '../tokens';
import { ISemesterRepository } from '../interfaces/semester.repository.interface';

@Injectable()
export class SemesterService {
  constructor(
    @Inject(SEMESTER_REPOSITORY)
    private readonly semesterRepository: ISemesterRepository,
  ) {}

  async create(createSemesterDto: CreateSemesterDto): Promise<Semester> {
    return await this.semesterRepository.create(createSemesterDto as Semester);
  }

  async findAll(): Promise<Semester[]> {
    return await this.semesterRepository.findAll();
  }

  async findOne(id: string): Promise<Semester> {
    const semester = await this.semesterRepository.findOne(id);
    if (!semester) {
      throw new NotFoundException(`Semestre con id ${id} no encontrado`);
    }
    return semester;
  }

  async update(id: string, updateSemesterDto: UpdateSemesterDto): Promise<Semester | null> {
    await this.findOne(id);
    return await this.semesterRepository.update(id, updateSemesterDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.semesterRepository.delete(id);
  }

  async findByUserId(userId: string, roleName?: string): Promise<Semester[]> {
    const currentYear = new Date().getFullYear();
    return await this.semesterRepository.findByUserId(userId, roleName, currentYear);
  }
}