import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from '../entities/faculty.entity';
import { Repository } from 'typeorm';
import { IFacultyRepository } from '../interfaces/faculty.repository.interface';

export class TypeormFacultiesRepository implements IFacultyRepository {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async create(faculty: Faculty): Promise<Faculty> {
    return await this.facultyRepository.save(faculty);
  }

  async findAll(): Promise<Faculty[]> {
    return await this.facultyRepository.find();
  }

  async findOne(id: string): Promise<Faculty | null> {
    return await this.facultyRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, faculty: Partial<Faculty>): Promise<Faculty | null> {
    await this.facultyRepository.update(id, faculty);
    const updatedfaculty = await this.facultyRepository.findOne({
      where: { id },
    });
    return updatedfaculty;
  }
  async delete(id: string): Promise<void> {
    await this.facultyRepository.delete(id);
  }
}
