import { Week } from '../entities/week.entity';

export interface IWeekRepository {
  findAll(): Promise<Week[]>;
  findById(id: string): Promise<Week | null>;
  findByBlockId(blockId: string): Promise<Week[]>;
  create(week: Week): Promise<Week>;
  update(id: string, week: Partial<Week>): Promise<Week | null>;
  delete(id: string): Promise<void>;
}
