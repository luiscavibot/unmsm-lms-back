import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClassSession } from '../entities/class-session.entity';
import { IClassSessionRepository } from '../interfaces/class-session.repository.interface';
import { CreateClassSessionDto } from '../dtos/create-class-session.dto';
import { UpdateClassSessionDto } from '../dtos/update-class-session.dto';
import { CLASS_SESSION_REPOSITORY } from '../tokens';
import { BlockService } from 'src/modules/blocks/services/block.service';
import { WeekService } from 'src/modules/weeks/services/week.service';

@Injectable()
export class ClassSessionService {
  constructor(
    @Inject(CLASS_SESSION_REPOSITORY)
    private readonly classSessionRepository: IClassSessionRepository,
    private readonly blockService: BlockService,
    private readonly weekService: WeekService
  ) {}

  async create(createClassSessionDto: CreateClassSessionDto): Promise<ClassSession> {
    // Verificar que el bloque existe
    await this.blockService.findById(createClassSessionDto.blockId);
    
    // Verificar que la semana existe
    await this.weekService.findById(createClassSessionDto.weekId);
    
    return await this.classSessionRepository.create(createClassSessionDto as ClassSession);
  }

  async findAll(): Promise<ClassSession[]> {
    return await this.classSessionRepository.findAll();
  }

  async findByBlockId(blockId: string): Promise<ClassSession[]> {
    // Verificar que el bloque existe
    await this.blockService.findById(blockId);
    
    return await this.classSessionRepository.findByBlockId(blockId);
  }

  async findByWeekId(weekId: string): Promise<ClassSession[]> {
    // Verificar que la semana existe
    await this.weekService.findById(weekId);
    
    return await this.classSessionRepository.findByWeekId(weekId);
  }

  async findOne(id: string): Promise<ClassSession> {
    const classSession = await this.classSessionRepository.findOne(id);
    if (!classSession) {
      throw new NotFoundException(`ClassSession with ID ${id} not found`);
    }
    return classSession;
  }

  async update(id: string, updateClassSessionDto: UpdateClassSessionDto): Promise<ClassSession | null> {
    await this.findOne(id);
    
    if (updateClassSessionDto.blockId) {
      await this.blockService.findById(updateClassSessionDto.blockId);
    }
    
    if (updateClassSessionDto.weekId) {
      await this.weekService.findById(updateClassSessionDto.weekId);
    }
    
    return await this.classSessionRepository.update(id, updateClassSessionDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.classSessionRepository.delete(id);
  }
}
