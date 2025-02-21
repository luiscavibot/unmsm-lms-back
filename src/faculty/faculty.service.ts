import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from './entities/faculty.entity';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async findAll(): Promise<Faculty[]> {
    return await this.facultyRepository.find();
  }

  async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    const faculty = new Faculty();
    faculty.faculty_name = createFacultyDto.faculty_name;
    return await this.facultyRepository.save(faculty);
  }

  async update(id: number, updateFacultyDto: UpdateFacultyDto): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne({ where: { faculty_id: id } });
    
    if (!faculty) {
      throw new Error('Faculty not found');
    }

    if (!updateFacultyDto.faculty_name) {
      throw new Error('Faculty name is required');
    }

    faculty.faculty_name = updateFacultyDto.faculty_name;
    return await this.facultyRepository.save(faculty);
  }
}
