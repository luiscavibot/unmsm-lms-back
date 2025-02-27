import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user.repository.interface';

@Injectable()
export class TypeormUsersRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    return await this.repository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find({
      relations: ['role'],
      select: {
        id: true,
        roleId: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });
  }

  async findOne(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['role'],
      select: {
        id: true,
        roleId: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    await this.repository.update(id, user);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
