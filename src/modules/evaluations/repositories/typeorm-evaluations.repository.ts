import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationRepository } from '../interfaces/evaluation-repository.interface';
import { Evaluation } from '../entities/evaluation.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { EnrollmentBlock } from '../../enrollment-blocks/entities/enrollment-block.entity';
import { StudentGradesResponseDto, EvaluationGradeDto } from '../dtos/student-grades-response.dto';
import { format } from 'date-fns';

@Injectable()
export class TypeormEvaluationsRepository implements EvaluationRepository {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(EnrollmentBlock)
    private readonly enrollmentBlockRepository: Repository<EnrollmentBlock>,
  ) {}

  async findAll(): Promise<Evaluation[]> {
    return this.evaluationRepository.find({
      relations: ['block'],
    });
  }

  async findById(id: string): Promise<Evaluation | null> {
    return this.evaluationRepository.findOne({
      where: { id },
      relations: ['block'],
    });
  }

  async findByBlockId(blockId: string): Promise<Evaluation[]> {
    return this.evaluationRepository.find({
      where: { blockId },
      relations: ['block'],
    });
  }

  async create(evaluation: Partial<Evaluation>): Promise<Evaluation> {
    const newEvaluation = this.evaluationRepository.create(evaluation);
    return this.evaluationRepository.save(newEvaluation);
  }

  async update(id: string, evaluation: Partial<Evaluation>): Promise<Evaluation | null> {
    await this.evaluationRepository.update(id, evaluation);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.evaluationRepository.delete(id);
  }

  async findStudentGradesByBlockId(blockId: string, userId: string): Promise<StudentGradesResponseDto> {
    try {
      // Buscar directamente la relación enrollment-block para este usuario y bloque
      const enrollmentBlock = await this.enrollmentBlockRepository
        .createQueryBuilder('enrollmentBlock')
        .innerJoinAndSelect('enrollmentBlock.enrollment', 'enrollment')
        .where('enrollmentBlock.blockId = :blockId', { blockId })
        .andWhere('enrollment.userId = :userId', { userId })
        .getOne();

      if (!enrollmentBlock) {
        throw new NotFoundException(
          `No se encontró matrícula para el usuario con ID ${userId} en el bloque ${blockId}`,
        );
      }

      // Usar el enrollmentId obtenido directamente
      const enrollmentId = enrollmentBlock.enrollmentId;

      // Obtener todas las evaluaciones del bloque junto con las notas del estudiante en una sola consulta
      const evaluationsWithGrades = await this.evaluationRepository
        .createQueryBuilder('evaluation')
        .select('evaluation.id', 'evaluationId')
        .addSelect('evaluation.title', 'title')
        .addSelect('evaluation.weight', 'weight')
        .addSelect('evaluation.evaluationDate', 'evaluationDate')
        .addSelect('grade.score', 'score')
        .leftJoin('grades', 'grade', 'grade.evaluationId = evaluation.id AND grade.enrollmentId = :enrollmentId', {
          enrollmentId: enrollmentId,
        })
        .where('evaluation.blockId = :blockId', { blockId })
        .orderBy('evaluation.evaluationDate', 'ASC')
        .getRawMany();

      // Formatear los resultados
      const evaluationGrades: EvaluationGradeDto[] = evaluationsWithGrades.map((item) => {
        return {
          name: item.title,
          weight: parseFloat(item.weight),
          evaluationDate: format(new Date(item.evaluationDate), 'dd/MM/yyyy'),
          grade: item.score ? parseFloat(item.score) : 0,
        };
      });

      // Calcular el promedio ponderado
      const totalWeight = evaluationGrades.reduce((acc, item) => acc + item.weight, 0);
      let weightedScoreSum = 0;

      evaluationGrades.forEach((item) => {
        weightedScoreSum += item.grade * item.weight;
      });

      const averageGrade = totalWeight > 0 ? parseFloat((weightedScoreSum / totalWeight).toFixed(2)) : 0;

      return {
        averageGrade,
        evaluations: evaluationGrades,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al obtener las notas: ${error.message}`);
    }
  }
}
