import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { EnrollmentBlock } from '../entities/enrollment-block.entity';
import { Block } from '../../blocks/entities/block.entity';
import { UserService } from '../../users/services/user.service';
import { StudentScoresResponseDto, StudentScoreDto, CourseStatisticsDto } from '../dtos/student-scores-response.dto';
import { BlockType } from '../../blocks/enums/block-type.enum';

@Injectable()
export class FindStudentScoresQuery {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(EnrollmentBlock)
    private readonly enrollmentBlockRepository: Repository<EnrollmentBlock>,
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    private readonly userService: UserService,
  ) {}

  /**
   * Encuentra las calificaciones de todos los estudiantes para un curso específico
   * @param courseOfferingId ID de la oferta de curso
   */
  async execute(courseOfferingId: string): Promise<StudentScoresResponseDto> {
    // 1. Obtener todas las inscripciones para este curso
    const enrollments = await this.enrollmentRepository.find({
      where: { courseOfferingId },
    });

    if (!enrollments || enrollments.length === 0) {
      return {
        students: [],
        meta: {
          averageCourse: 0,
          highScore: 0,
          lowScore: 0,
          standardDeviation: 0,
          passedStudents: 0,
          failedStudents: 0,
        },
      };
    }

    // 2. Obtener bloques del curso para identificar cuáles son de teoría y cuáles de práctica
    const blocks = await this.blockRepository.find({
      where: { courseOfferingId },
    });

    const theoryBlockIds = blocks
      .filter(block => block.type === BlockType.THEORY)
      .map(block => block.id);
    
    const practiceBlockIds = blocks
      .filter(block => block.type === BlockType.PRACTICE)
      .map(block => block.id);

    // 3. Obtener todas las inscripciones en bloques para los estudiantes de este curso
    const enrollmentIds = enrollments.map(enrollment => enrollment.id);
    const enrollmentBlocks = await this.enrollmentBlockRepository.find({
      where: { enrollmentId: In(enrollmentIds) },
      relations: ['block'],
    });

    // 4. Organizar la información por estudiante
    const studentMap = new Map<string, {
      userId: string,
      enrollmentId: string,
      theoryScore: number | null,
      practiceScore: number | null,
      finalScore: number,
    }>();

    // Preparar mapa de estudiantes con sus datos básicos
    for (const enrollment of enrollments) {
      studentMap.set(enrollment.id, {
        userId: enrollment.userId,
        enrollmentId: enrollment.id,
        theoryScore: null,
        practiceScore: null,
        finalScore: enrollment.finalAverage || 0,
      });
    }

    // Añadir las notas por tipo de bloque
    for (const enrollmentBlock of enrollmentBlocks) {
      const student = studentMap.get(enrollmentBlock.enrollmentId);
      if (student) {
        if (theoryBlockIds.includes(enrollmentBlock.blockId)) {
          student.theoryScore = enrollmentBlock.blockAverage;
        } else if (practiceBlockIds.includes(enrollmentBlock.blockId)) {
          student.practiceScore = enrollmentBlock.blockAverage;
        }
      }
    }

    // 5. Obtener los nombres de los estudiantes en paralelo
    const userIds = Array.from(studentMap.values()).map(student => student.userId);
    const userPromises = userIds.map(userId => 
      this.userService.findOne(userId)
        .then(user => ({ userId, name: user.name }))
        .catch(() => ({ userId, name: `Usuario ${userId.substring(0, 8)}...` }))
    );

    const userResults = await Promise.all(userPromises);
    const userNameMap = new Map(userResults.map(result => [result.userId, result.name]));

    // 6. Construir el resultado final
    const studentScores: StudentScoreDto[] = Array.from(studentMap.values()).map(student => ({
      userId: student.userId,
      nombre: userNameMap.get(student.userId) || `Usuario ${student.userId.substring(0, 8)}...`,
      theoryScore: student.theoryScore,
      practiceScore: student.practiceScore,
      finalScore: student.finalScore,
    }));

    // 7. Calcular estadísticas
    const finalScores = studentScores.map(student => student.finalScore);
    
    const averageCourse = this.calculateAverage(finalScores);
    const highScore = Math.max(...finalScores);
    const lowScore = Math.min(...finalScores);
    const standardDeviation = this.calculateStandardDeviation(finalScores);
    
    const PASSING_SCORE = 10.5;
    const passedStudents = studentScores.filter(student => student.finalScore >= PASSING_SCORE).length;
    const failedStudents = studentScores.length - passedStudents;

    // 8. Retornar el DTO completo
    return {
      students: studentScores,
      meta: {
        averageCourse,
        highScore,
        lowScore,
        standardDeviation,
        passedStudents,
        failedStudents,
      },
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, value) => acc + value, 0);
    return parseFloat((sum / values.length).toFixed(2));
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length <= 1) return 0;
    
    const avg = this.calculateAverage(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const variance = this.calculateAverage(squareDiffs);
    
    return parseFloat(Math.sqrt(variance).toFixed(2));
  }
}
