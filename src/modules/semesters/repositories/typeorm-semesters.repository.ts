import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Semester } from '../entities/semester.entity';
import { ISemesterRepository } from '../interfaces/semester.repository.interface';
import { FindSemestersByUserIdQuery, UserRoles } from '../queries/find-semesters-by-user-id.query';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { BlockAssignment } from '../../block-assignments/entities/block-assignment.entity';

@Injectable()
export class TypeormSemestersRepository implements ISemesterRepository {
  private readonly findSemestersByUserIdQuery: FindSemestersByUserIdQuery;

  constructor(
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(BlockAssignment)
    private readonly blockAssignmentRepository: Repository<BlockAssignment>,
  ) {
    this.findSemestersByUserIdQuery = new FindSemestersByUserIdQuery(
      semesterRepository,
      enrollmentRepository,
      blockAssignmentRepository
    );
  }

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

  async findByUserId(userId: string, roleName: string = UserRoles.STUDENT, currentYear?: number): Promise<Semester[]> {
    return await this.findSemestersByUserIdQuery.execute(userId, roleName, currentYear);
  }
}