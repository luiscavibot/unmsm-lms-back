import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Faculty } from '../entities/faculty.entity';
import { CreateFacultyDto } from '../dtos/create-faculty.dto';
import { UpdateFacultyDto } from '../dtos/update-faculty.dto';
import { FACULTY_REPOSITORY } from '../tokens';
import { IFacultyRepository } from '../interfaces/faculty.repository.interface';

@Injectable()
export class FacultyService {
  constructor(
    @Inject(FACULTY_REPOSITORY)
    private readonly facultyRepository: IFacultyRepository,
  ) {}

  async findAll(): Promise<Faculty[]> {
    return await this.facultyRepository.findAll();
  }

  async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    return await this.facultyRepository.create(createFacultyDto);
  }

  async findOne(id: string): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne(id);
    if (!faculty) {
      throw new NotFoundException(`Facultad con id ${id} no encontrado`);
    }
    return faculty;
  }

  async update(id: string, updateFacultyDto: UpdateFacultyDto): Promise<Faculty | null> {
    await this.findOne(id);
    return this.facultyRepository.update(id, updateFacultyDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    return this.facultyRepository.delete(id);
  }
}
