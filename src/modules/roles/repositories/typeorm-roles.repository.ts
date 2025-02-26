import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { IRoleRepository } from '../interfaces/role.repository.interface';

@Injectable()
export class TypeormRolesRepository implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  async create(role: Partial<Role>): Promise<Role> {
    const newRole = this.repository.create(role);
    return await this.repository.save(newRole);
  }

  async findAll(): Promise<Role[]> {
    return await this.repository.find();
  }

  async findOne(id: string): Promise<Role | null> {
    return await this.repository.findOneBy({ id });
  }

  async update(id: string, role: Partial<Role>): Promise<Role | null> {
    await this.repository.update(id, role);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
