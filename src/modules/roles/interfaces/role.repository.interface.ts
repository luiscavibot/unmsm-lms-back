import { Role } from '../entities/role.entity';

export interface IRoleRepository {
  create(role: Partial<Role>): Promise<Role>;
  findAll(): Promise<Role[]>;
  findOne(id: string): Promise<Role | null>;
  update(id: string, role: Partial<Role>): Promise<Role | null>;
  delete(id: string): Promise<void>;
}
