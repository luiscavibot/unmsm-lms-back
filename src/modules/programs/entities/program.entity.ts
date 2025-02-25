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
    default: ProgramType.PREGRADO
  })
  type: ProgramType;

  @ManyToOne(() => Faculty, { onDelete: 'CASCADE' })
  faculty: Faculty;

  @Column()
  facultyId: string;
}