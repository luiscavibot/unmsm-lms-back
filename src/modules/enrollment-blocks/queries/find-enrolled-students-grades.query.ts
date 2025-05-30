import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EnrollmentBlock } from '../entities/enrollment-block.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';
import { UserService } from '../../users/services/user.service';
import { EnrolledStudentsGradesResponseDto, EnrolledStudentGradeDto, StudentEvaluationDto } from '../dtos/enrolled-students-grades-response.dto';

@Injectable()
export class FindEnrolledStudentsGradesQuery {
  constructor(
    @InjectRepository(EnrollmentBlock)
    private readonly enrollmentBlockRepository: Repository<EnrollmentBlock>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    private readonly userService: UserService,
  ) {}

  /**
   * Encuentra todos los estudiantes matriculados en un bloque específico y sus notas
   * @param blockId ID del bloque
   */
  async execute(blockId: string): Promise<EnrolledStudentsGradesResponseDto> {
    // 1. Obtener todas las matrículas para este bloque
    const enrollmentBlocks = await this.enrollmentBlockRepository.find({
      where: { blockId },
      relations: ['enrollment'],
    });

    // Preparar la respuesta
    const result: EnrolledStudentsGradesResponseDto = {
      studentNumber: 0,
      students: [],
    };

    // Si no hay matrículas, devolver array vacío
    if (!enrollmentBlocks || enrollmentBlocks.length === 0) {
      return result;
    }

    // Extraer los enrollmentIds para usar en consultas posteriores
    const enrollmentIds = enrollmentBlocks.map((eb) => eb.enrollmentId);

    // 2. Obtener información de todos los enrollments de una vez
    const enrollments = await this.enrollmentRepository.find({
      where: { id: In(enrollmentIds) },
    });

    // Crear un mapa de enrollmentId -> userId para acceso rápido
    const enrollmentToUserMap = new Map<string, string>();
    enrollments.forEach((enrollment) => {
      enrollmentToUserMap.set(enrollment.id, enrollment.userId);
    });

    // 3. Obtener todas las evaluaciones para este bloque
    const evaluations = await this.evaluationRepository.find({
      where: { blockId },
      order: { evaluationDate: 'ASC' },
    });

    if (!evaluations || evaluations.length === 0) {
      // Si no hay evaluaciones, retornar estudiantes sin evaluaciones
      const studentDataPromises: Promise<EnrolledStudentGradeDto>[] = [];
      
      for (const enrollmentBlock of enrollmentBlocks) {
        const enrollmentId = enrollmentBlock.enrollmentId;
        const userId = enrollmentToUserMap.get(enrollmentId);
        
        if (userId) {
          const studentPromise = this.userService.findOne(userId)
            .then(user => {
              return {
                userName: user.name,
                enrollmentId,
                averageScore: 0,
                evaluations: [],
              } as EnrolledStudentGradeDto;
            })
            .catch(error => {
              console.error(`Error al obtener información del usuario ${userId}:`, error);
              return {
                userName: `Usuario ${userId.substring(0, 8)}...`,
                enrollmentId,
                averageScore: 0,
                evaluations: [],
              } as EnrolledStudentGradeDto;
            });
          
          studentDataPromises.push(studentPromise);
        }
      }
      
      result.students = await Promise.all(studentDataPromises);
      result.studentNumber = result.students.length;
      return result;
    }
    
    // 4. Obtener todas las calificaciones para estos enrollments y evaluaciones
    const evaluationIds = evaluations.map(evaluation => evaluation.id);
    const grades = await this.gradeRepository.find({
      where: {
        enrollmentId: In(enrollmentIds),
        evaluationId: In(evaluationIds),
      },
    });

    // Crear un mapa de enrollmentId,evaluationId -> score para acceso rápido
    const gradesMap = new Map<string, number>();
    grades.forEach((grade) => {
      const key = `${grade.enrollmentId}_${grade.evaluationId}`;
      gradesMap.set(key, grade.score);
    });

    // 5. Construir la respuesta final con la información de los usuarios y sus notas
    const studentDataPromises: Promise<EnrolledStudentGradeDto>[] = [];
    
    for (const enrollmentBlock of enrollmentBlocks) {
      const enrollmentId = enrollmentBlock.enrollmentId;
      const userId = enrollmentToUserMap.get(enrollmentId);
      
      if (userId) {
        const studentPromise = this.userService.findOne(userId)
          .then(user => {
            // Obtener todas las evaluaciones de este estudiante
            const studentEvaluations: StudentEvaluationDto[] = [];
            let totalScore = 0;
            let totalWeight = 0;
            
            for (const evaluation of evaluations) {
              const key = `${enrollmentId}_${evaluation.id}`;
              const score = gradesMap.get(key) || 0;
              
              studentEvaluations.push({
                evaluationId: evaluation.id,
                score,
              });
              
              totalScore += score * evaluation.weight;
              totalWeight += evaluation.weight;
            }
            
            const averageScore = totalWeight > 0 
              ? parseFloat((totalScore / totalWeight).toFixed(2)) 
              : 0;
            
            return {
              userName: user.name,
              enrollmentId,
              averageScore,
              evaluations: studentEvaluations,
            } as EnrolledStudentGradeDto;
          })
          .catch(error => {
            console.error(`Error al obtener información del usuario ${userId}:`, error);
            return {
              userName: `Usuario ${userId.substring(0, 8)}...`,
              enrollmentId,
              averageScore: 0,
              evaluations: [],
            } as EnrolledStudentGradeDto;
          });
        
        studentDataPromises.push(studentPromise);
      }
    }
    
    // Esperar a que todas las promesas se resuelvan en paralelo
    result.students = await Promise.all(studentDataPromises);
    
    // Actualizar el número de estudiantes en los metadatos
    result.studentNumber = result.students.length;

    return result;
  }
}
