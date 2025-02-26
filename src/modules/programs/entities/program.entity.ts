import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Faculty } from '../../faculties/entities/faculty.entity';
import { ProgramType } from '../enums/program-type.enum';

@Entity({ name: 'programs' })
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ProgramType,
    default: ProgramType.Pregrado
  })
  type: ProgramType;

  @ManyToOne(() => Faculty, { onDelete: 'SET NULL' })
  faculty: Faculty;

  @Column({ nullable: true })
  facultyId: string;
}