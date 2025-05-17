import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EvaluationRepository } from '../interfaces/evaluation-repository.interface';
import { EVALUATION_REPOSITORY } from '../tokens/index';
import { Evaluation } from '../entities/evaluation.entity';
import { CreateEvaluationDto } from '../dtos/create-evaluation.dto';
import { UpdateEvaluationDto } from '../dtos/update-evaluation.dto';
import { StudentGradesResponseDto } from '../dtos/student-grades-response.dto';

@Injectable()
export class EvaluationService {
  constructor(
    @Inject(EVALUATION_REPOSITORY)
    private readonly evaluationRepository: EvaluationRepository,
  ) {}

  async findAll(): Promise<Evaluation[]> {
    return this.evaluationRepository.findAll();
  }

  async findById(id: string): Promise<Evaluation> {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    return evaluation;
  }

  async findByBlockId(blockId: string): Promise<Evaluation[]> {
    return this.evaluationRepository.findByBlockId(blockId);
  }

  async create(createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
    const evaluationData: Partial<Evaluation> = {
      ...createEvaluationDto,
      evaluationDate: new Date(createEvaluationDto.evaluationDate)
    };
    return this.evaluationRepository.create(evaluationData);
  }

  async update(id: string, updateEvaluationDto: UpdateEvaluationDto): Promise<Evaluation> {
    // Crear un objeto vacío del tipo correcto
    const evaluationData: Partial<Evaluation> = {};
    
    // Copiar manualmente cada propiedad, haciendo la conversión cuando sea necesario
    if (updateEvaluationDto.blockId !== undefined) {
      evaluationData.blockId = updateEvaluationDto.blockId;
    }
    
    if (updateEvaluationDto.title !== undefined) {
      evaluationData.title = updateEvaluationDto.title;
    }
    
    if (updateEvaluationDto.evaluationDate !== undefined) {
      evaluationData.evaluationDate = new Date(updateEvaluationDto.evaluationDate);
    }
    
    if (updateEvaluationDto.weight !== undefined) {
      evaluationData.weight = updateEvaluationDto.weight;
    }
    
    const updatedEvaluation = await this.evaluationRepository.update(id, evaluationData);
    if (!updatedEvaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    return updatedEvaluation;
  }

  async delete(id: string): Promise<void> {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    await this.evaluationRepository.delete(id);
  }

  async findStudentGradesByBlockId(blockId: string, userId: string): Promise<StudentGradesResponseDto> {
    try {
      return await this.evaluationRepository.findStudentGradesByBlockId(blockId, userId);
    } catch (error) {
      throw new NotFoundException(`No se pudieron encontrar las notas para el bloque ${blockId} y el usuario ${userId}: ${error.message}`);
    }
  }
}