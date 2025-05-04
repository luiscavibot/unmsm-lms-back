import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BlockRolType } from '../enums/block-rol-type.enum';

@Entity({ name: 'block_assignments' })
export class BlockAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: BlockRolType,
    default: BlockRolType.COLLABORATOR
  })
  blockRol: BlockRolType;
}