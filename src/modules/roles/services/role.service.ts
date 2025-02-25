import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { ROLE_REPOSITORY } from '../tokens/tokens';
import { IRoleRepository } from '../interfaces/role.repository.interface';

@Injectable()
export class RoleService {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.roleRepository.create(createRoleDto);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne(id);
    if (!role) {
      throw new NotFoundException(`Rol con id ${id} no encontrado`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
    await this.findOne(id);
    return this.roleRepository.update(id, updateRoleDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    return this.roleRepository.delete(id);
  }
}
