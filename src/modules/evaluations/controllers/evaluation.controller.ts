import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { EvaluationService } from '../services/evaluation.service';
import { Evaluation } from '../entities/evaluation.entity';
import { CreateEvaluationDto } from '../dtos/create-evaluation.dto';
import { UpdateEvaluationDto } from '../dtos/update-evaluation.dto';

@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Get()
  async findAll(@Query('blockId') blockId?: string): Promise<Evaluation[]> {
    if (blockId) {
      return this.evaluationService.findByBlockId(blockId);
    }
    return this.evaluationService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Evaluation> {
    return this.evaluationService.findById(id);
  }

  @Post()
  async create(@Body() createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
    return this.evaluationService.create(createEvaluationDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEvaluationDto: UpdateEvaluationDto,
  ): Promise<Evaluation> {
    return this.evaluationService.update(id, updateEvaluationDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.evaluationService.delete(id);
  }
}