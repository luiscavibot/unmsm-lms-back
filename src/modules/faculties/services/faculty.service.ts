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
    const user = await this.facultyRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateFacultyDto,
  ): Promise<Faculty | null> {
    const user = await this.findOne(id);
    return this.facultyRepository.update(user.id, updateUserDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    return this.facultyRepository.delete(id);
  }
}
