import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../interfaces/grade.repository.interface';
import { CreateGradeDto } from '../dtos/create-grade.dto';
import { UpdateGradeDto } from '../dtos/update-grade.dto';
import { GRADE_REPOSITORY } from '../tokens';
import { EnrollmentService } from '../../enrollments/services/enrollment.service';
import { EvaluationService } from '../../evaluations/services/evaluation.service';

@Injectable()
export class GradeService {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private readonly gradeRepository: IGradeRepository,
    private readonly enrollmentService: EnrollmentService,
    private readonly evaluationService: EvaluationService,
  ) {}

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    // Verificar que la evaluación existe si se proporciona evaluationId
    if (createGradeDto.evaluationId) {
      await this.evaluationService.findById(createGradeDto.evaluationId);
    }
    
    // Verificar que la inscripción existe si se proporciona enrollmentId
    if (createGradeDto.enrollmentId) {
      await this.enrollmentService.findOne(createGradeDto.enrollmentId);
    }
    
    return await this.gradeRepository.create(createGradeDto);
  }

  async findAll(): Promise<Grade[]> {
    return await this.gradeRepository.findAll();
  }

  async findOne(id: string): Promise<Grade> {
    const grade = await this.gradeRepository.findOne(id);
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return grade;
  }

  async findByEvaluationId(evaluationId: string): Promise<Grade[]> {
    // Verificar que la evaluación existe
    await this.evaluationService.findById(evaluationId);
    
    return await this.gradeRepository.findByEvaluationId(evaluationId);
  }

  async findByEnrollmentId(enrollmentId: string): Promise<Grade[]> {
    // Verificar que la inscripción existe
    await this.enrollmentService.findOne(enrollmentId);
    
    return await this.gradeRepository.findByEnrollmentId(enrollmentId);
  }

  async update(id: string, updateGradeDto: UpdateGradeDto): Promise<Grade | null> {
    // Verificar que la calificación existe
    await this.findOne(id);
    
    // Verificar que la evaluación existe si se proporciona evaluationId
    if (updateGradeDto.evaluationId) {
      await this.evaluationService.findById(updateGradeDto.evaluationId);
    }
    
    // Verificar que la inscripción existe si se proporciona enrollmentId
    if (updateGradeDto.enrollmentId) {
      await this.enrollmentService.findOne(updateGradeDto.enrollmentId);
    }
    
    return await this.gradeRepository.update(id, updateGradeDto);
  }

  async remove(id: string): Promise<void> {
    // Verificar que la calificación existe
    await this.findOne(id);
    
    await this.gradeRepository.delete(id);
  }
}