import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Semester } from '../entities/semester.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { BlockAssignment } from '../../block-assignments/entities/block-assignment.entity';

/**
 * Roles de usuario soportados
 */
export enum UserRoles {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

/**
 * Query Object para buscar semestres relacionados con un usuario
 */
@Injectable()
export class FindSemestersByUserIdQuery {
  constructor(
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(BlockAssignment)
    private readonly blockAssignmentRepository: Repository<BlockAssignment>,
  ) {}

  /**
   * Ejecuta la consulta para encontrar semestres relacionados con un usuario según su rol
   * @param userId ID del usuario
   * @param roleName Rol del usuario (STUDENT o TEACHER)
   * @param currentYear Año actual (opcional, por defecto es el año actual)
   * @returns Lista de semestres relacionados con el usuario
   */
  async execute(userId: string, roleName: string = UserRoles.STUDENT, currentYear?: number): Promise<Semester[]> {
    const actualYear = currentYear || new Date().getUTCFullYear();
    const lastYear = actualYear - 1;
    
    // Bases para filtros de tiempo
    const timeFilter = {
      lastYear,
      actualYear
    };
    
    // Seleccionar la consulta basada en el rol del usuario
    if (roleName === UserRoles.TEACHER) {
      return this.findSemestersByTeacher(userId, timeFilter);
    } else {
      // Por defecto, asumimos que es un estudiante
      return this.findSemestersByStudent(userId, timeFilter);
    }
  }
  
  /**
   * Encuentra los semestres asociados a un estudiante mediante sus matrículas
   * @param userId ID del estudiante
   * @param timeFilter Filtro de tiempo (años)
   * @returns Lista de semestres
   */
  private async findSemestersByStudent(userId: string, timeFilter: { lastYear: number, actualYear: number }): Promise<Semester[]> {
    return await this.semesterRepository
      .createQueryBuilder('semester')
      .distinct(true)
      .innerJoin('course_offerings', 'co', 'co.semesterId = semester.id')
      .innerJoin('enrollments', 'e', 'e.courseOfferingId = co.id')
      .where('e.userId = :userId', { userId })
      .andWhere('semester.year >= :lastYear AND semester.year <= :actualYear', timeFilter)
      .orderBy('semester.year', 'DESC')
      .addOrderBy('semester.name', 'DESC')
      .getMany();
  }
  
  /**
   * Encuentra los semestres asociados a un profesor mediante sus asignaciones de bloque
   * @param userId ID del profesor
   * @param timeFilter Filtro de tiempo (años)
   * @returns Lista de semestres
   */
  private async findSemestersByTeacher(userId: string, timeFilter: { lastYear: number, actualYear: number }): Promise<Semester[]> {
    return await this.semesterRepository
      .createQueryBuilder('semester')
      .distinct(true)
      .innerJoin('course_offerings', 'co', 'co.semesterId = semester.id')
      .innerJoin('block_assignments', 'ba', 'ba.courseOfferingId = co.id')
      .where('ba.userId = :userId', { userId })
      .andWhere('semester.year >= :lastYear AND semester.year <= :actualYear', timeFilter)
      .orderBy('semester.year', 'DESC')
      .addOrderBy('semester.name', 'DESC')
      .getMany();
  }
}
