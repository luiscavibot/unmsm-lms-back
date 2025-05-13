import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Week } from '../entities/week.entity';
import { IWeekRepository } from '../interfaces/week.repository.interface';
import { WEEK_REPOSITORY } from '../tokens';
import { CreateWeekDto } from '../dtos/create-week.dto';
import { UpdateWeekDto } from '../dtos/update-week.dto';
import { BlockService } from 'src/modules/blocks/services/block.service';

@Injectable()
export class WeekService {
  constructor(
    @Inject(WEEK_REPOSITORY)
    private readonly weekRepository: IWeekRepository,
    private readonly blockService: BlockService,
  ) {}

  async findAll(): Promise<Week[]> {
    return this.weekRepository.findAll();
  }

  async findById(id: string): Promise<Week> {
    const week = await this.weekRepository.findById(id);
    if (!week) {
      throw new NotFoundException(`Week with ID ${id} not found`);
    }
    return week;
  }

  async findByBlockId(blockId: string): Promise<Week[]> {
    // Verificar que el bloque existe
    await this.blockService.findById(blockId);
    
    return this.weekRepository.findByBlockId(blockId);
  }

  async create(createWeekDto: CreateWeekDto): Promise<Week> {
    // Verificar que el bloque existe
    await this.blockService.findById(createWeekDto.blockId);
    
    return this.weekRepository.create(createWeekDto as Week);
  }

  async update(id: string, updateWeekDto: UpdateWeekDto): Promise<Week> {
    // Verificar que la semana existe
    await this.findById(id);
    
    // Si se está actualizando el blockId, verificar que el bloque existe
    if (updateWeekDto.blockId) {
      await this.blockService.findById(updateWeekDto.blockId);
    }
    
    const updatedWeek = await this.weekRepository.update(id, updateWeekDto);
    if (!updatedWeek) {
      throw new NotFoundException(`Week with ID ${id} not found`);
    }
    return updatedWeek;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.weekRepository.delete(id);
  }
}
