import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Semester } from '../entities/semester.entity';
import { ISemesterRepository } from '../interfaces/semester.repository.interface';

@Injectable()
export class TypeormSemestersRepository implements ISemesterRepository {
  constructor(
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
  ) {}

  async create(semester: Partial<Semester>): Promise<Semester> {
    return await this.semesterRepository.save(semester);
  }

  async findAll(): Promise<Semester[]> {
    return await this.semesterRepository.find();
  }

  async findOne(id: string): Promise<Semester | null> {
    return await this.semesterRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, semester: Partial<Semester>): Promise<Semester | null> {
    await this.semesterRepository.update(id, semester);
    return await this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.semesterRepository.delete(id);
  }

  async findByUserId(userId: string, currentYear?: number): Promise<Semester[]> {
    const actualYear = currentYear || new Date().getFullYear();
    const lastYear = actualYear - 1;
    
    return await this.semesterRepository
      .createQueryBuilder('semester')
      .distinct(true)
      .innerJoin('course_offerings', 'co', 'co.semesterId = semester.id')
      .innerJoin('enrollments', 'e', 'e.courseOfferingId = co.id')
      .where('e.userId = :userId', { userId })
      .andWhere('semester.year >= :lastYear AND semester.year <= :actualYear', { 
        lastYear,
        actualYear 
      })
      .orderBy('semester.year', 'DESC')
      .addOrderBy('semester.name', 'DESC')
      .getMany();
  }
}