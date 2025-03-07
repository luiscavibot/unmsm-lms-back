import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { IAttendanceRepository } from '../interfaces/attendance.repository.interface';

export class TypeormAttendanceRepository implements IAttendanceRepository {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async create(attendance: Attendance): Promise<Attendance> {
    return await this.attendanceRepository.save(attendance);
  }

  async findAll(): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      relations: ['enrollment', 'classSession'],
    });
  }

  async findOne(id: string): Promise<Attendance | null> {
    return await this.attendanceRepository.findOne({
      where: { id },
      relations: ['enrollment', 'classSession'],
    });
  }

  async update(id: string, attendance: Partial<Attendance>): Promise<Attendance | null> {
    await this.attendanceRepository.update(id, attendance);
    return await this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.attendanceRepository.delete(id);
  }
}
