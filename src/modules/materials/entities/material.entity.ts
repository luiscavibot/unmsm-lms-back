import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Week } from '../../weeks/entities/week.entity';
import { MaterialType } from '../enums/material-type.enum';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'materials' })
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  weekId: string;

  @Column({ length: 255 })
  title: string;

  @Column({
    type: 'enum',
    enum: MaterialType,
    default: MaterialType.CLASS_SLIDES
  })
  type: MaterialType;

  @Column({ type: 'text' })
  fileUrl: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ nullable: true })
  uploadedById: string;

  @ManyToOne(() => Week, { onDelete: 'SET NULL' })
  week: Week;
}
