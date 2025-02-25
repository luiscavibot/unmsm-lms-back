import { Program } from '../entities/program.entity';

export interface IProgramRepository {
  create(program: Partial<Program>): Promise<Program>;
  findAll(): Promise<Program[]>;
  findOne(id: string): Promise<Program | null>;
  update(id: string, program: Partial<Program>): Promise<Program | null>;
  delete(id: string): Promise<void>;
}