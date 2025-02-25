import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'faculties' })
export class Faculty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;
}
