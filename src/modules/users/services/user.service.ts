import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { USER_REPOSITORY } from '../tokens';
import { ROLE_REPOSITORY } from '../../roles/tokens';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { IRoleRepository } from '../../roles/interfaces/role.repository.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.roleId) {
      const role = await this.roleRepository.findOne(createUserDto.roleId);
      if (!role) {
        throw new NotFoundException(`El rol con id ${createUserDto.roleId} no existe`);
      }
    }

    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new NotFoundException('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;

    return await this.userRepository.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`Usuario con correo electrónico ${email} no encontrado`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.findOne(id);
    if (updateUserDto.roleId) {
      const role = await this.roleRepository.findOne(updateUserDto.roleId);
      if (!role) {
        throw new NotFoundException(`El rol con id ${updateUserDto.roleId} no existe`);
      }
    }
    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('El correo electrónico ya está registrado');
      }
    }

    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.password = hashedPassword;
    }

    return this.userRepository.update(id, updateUserDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    return this.userRepository.delete(id);
  }

  async updateProfileImage(id: string, imgUrl: string): Promise<User | null> {
    await this.findOne(id);
    return this.userRepository.update(id, { imgUrl });
  }
}
