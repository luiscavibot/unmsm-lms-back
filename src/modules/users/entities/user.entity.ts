import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  roleId: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password?: string;

  @Column({ nullable: true })
  imgUrl?: string;

  @Column({ nullable: true, type: 'text' })
  resumeUrl?: string;

  @ManyToOne(() => Role, { onDelete: 'SET NULL' })
  role: Role;
}
