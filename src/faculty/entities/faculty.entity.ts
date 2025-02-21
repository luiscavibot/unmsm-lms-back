import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Faculty {
  @PrimaryGeneratedColumn('increment')
  faculty_id: number;

  @Column()
  faculty_name: string;
}
