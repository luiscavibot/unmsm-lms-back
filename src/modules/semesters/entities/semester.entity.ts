import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'semesters' })
export class Semester {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;
}