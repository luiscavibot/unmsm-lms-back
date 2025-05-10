import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'semesters' })
export class Semester {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  name: string; // Número romano del semestre (I, II, etc.)

  @Column({ type: 'int' })
  year: number; // Año al que pertenece el semestre
}