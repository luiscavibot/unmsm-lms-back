import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { BlockAssignment } from '../../block-assignments/entities/block-assignment.entity';
import { BlockRolType } from '../../block-assignments/enums/block-rol-type.enum';
import { CoursesByProgramTypeDto } from '../dtos/courses-by-program-type.dto';
import {
  CoursesByProgramTypeResponseDto,
  CourseDataDto,
  MetaDto,
  ProgramWithCoursesDto,
} from '../dtos/courses-by-program-type-response.dto';
import { UserService } from '../../users/services/user.service';

/**
 * Roles de usuario soportados
 */
export enum UserRoles {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

@Injectable()
export class FindCoursesByProgramTypeQuery {
  // Cache para reducir consultas repetidas a la base de datos
  private teacherCache: Map<string, { name: string; imgUrl: string }> = new Map();

  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(BlockAssignment)
    private readonly blockAssignmentRepository: Repository<BlockAssignment>,
    private readonly userService: UserService,
  ) {}

  /**
   * Construye la consulta base para estudiantes usando la tabla enrollment
   */
  private buildStudentQuery(userId: string, filters: CoursesByProgramTypeDto): SelectQueryBuilder<Enrollment> {
    const query = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .where('enrollment.userId = :userId', { userId })
      .leftJoinAndSelect('enrollment.courseOffering', 'courseOffering')
      .leftJoinAndSelect('courseOffering.program', 'program')
      .leftJoinAndSelect('courseOffering.course', 'course')
      .leftJoinAndSelect('courseOffering.semester', 'semester');

    // Aplicar filtros comunes
    this.applyCommonFilters(query, filters);

    return query;
  }

  /**
   * Construye la consulta base para profesores usando la tabla block-assignments
   */
  private buildTeacherQuery(userId: string, filters: CoursesByProgramTypeDto): SelectQueryBuilder<BlockAssignment> {
    const query = this.blockAssignmentRepository
      .createQueryBuilder('blockAssignment')
      .where('blockAssignment.userId = :userId', { userId })
      .leftJoinAndSelect('blockAssignment.courseOffering', 'courseOffering')
      .leftJoinAndSelect('courseOffering.program', 'program')
      .leftJoinAndSelect('courseOffering.course', 'course')
      .leftJoinAndSelect('courseOffering.semester', 'semester')
      .distinctOn(['courseOffering.id']);  // Evita duplicados de course offerings

    // Aplicar filtros comunes
    this.applyCommonFilters(query, filters);

    return query;
  }

  /**
   * Aplica filtros comunes a las consultas
   */
  private applyCommonFilters<T extends object>(query: SelectQueryBuilder<T>, filters: CoursesByProgramTypeDto): void {
    const { status, programType, semester, keyword } = filters;

    // Aplicar filtro de estado
    if (status) {
      if (status === 'current') {
        query.andWhere('courseOffering.status IN (:...statuses)', { statuses: ['current', 'unstarted'] });
      } else {
        query.andWhere('courseOffering.status = :status', { status });
      }
    }

    // Aplicar filtro de tipo de programa
    if (programType) {
      query.andWhere('program.type = :programType', { programType });
    }

    // Aplicar filtro de semestre
    if (semester) {
      query.andWhere('courseOffering.semesterId = :semester', { semester });
    } else {
      // Si no se proporciona un semestre, filtrar por los últimos 2 años
      const actualYear = new Date().getFullYear();
      const lastYear = actualYear - 1;
      query.andWhere('semester.year >= :lastYear AND semester.year <= :actualYear', {
        lastYear,
        actualYear,
      });
    }

    // Aplicar filtro por palabra clave
    if (keyword) {
      query.andWhere('(course.name LIKE :keyword OR program.name LIKE :keyword)', { keyword: `%${keyword}%` });
    }
  }

  /**
   * Encuentra el profesor responsable para un course offering específico
   */
  private async findResponsibleTeacher(courseOfferingId: string) {
    // Verificar si ya tenemos la información en caché
    if (this.teacherCache.has(courseOfferingId)) {
      return this.teacherCache.get(courseOfferingId)!;
    }

    const teacherAssignment = await this.blockAssignmentRepository.findOne({
      where: { 
        courseOfferingId,
        blockRol: BlockRolType.RESPONSIBLE 
      }
    });

    let teacher = {
      name: 'Sin profesor asignado',
      imgUrl: 'https://www.imagen.com',
    };

    if (teacherAssignment) {
      try {
        const user = await this.userService.findOne(teacherAssignment.userId);
        teacher = {
          name: user.name,
          imgUrl: user.imgUrl || 'https://www.imagen.com',
        };
      } catch (error) {
        console.error('Error al obtener información del usuario:', error);
      }
    }

    // Guardar en caché para futuras consultas
    this.teacherCache.set(courseOfferingId, teacher);

    return teacher;
  }

  /**
   * Construye un objeto CourseDataDto a partir de un courseOffering
   */
  private async buildCourseData(courseOffering: any): Promise<CourseDataDto> {
    const teacher = await this.findResponsibleTeacher(courseOffering.id);
    const startDate = new Date(courseOffering.startDate);
    const endDate = new Date(courseOffering.endDate);

    return {
      courseId: courseOffering.id,
      name: courseOffering.course.name,
      teacher,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      semester: courseOffering.semester.year + '-' + courseOffering.semester.name,
      module: courseOffering.module || '',
      unstarted: courseOffering.status === 'unstarted',
    };
  }

  /**
   * Procesa los resultados de la consulta y organiza por programas
   */
  private async processResults<T>(
    items: T[], 
    extractCourseOffering: (item: T) => any,
    checkDuplicates = false
  ): Promise<ProgramWithCoursesDto[]> {
    const programsMap: Map<string, ProgramWithCoursesDto> = new Map();
    
    for (const item of items) {
      const courseOffering = extractCourseOffering(item);
      
      // Verificar si ya tenemos el programa en el mapa
      if (!programsMap.has(courseOffering.programId)) {
        const program = courseOffering.program;
        programsMap.set(program.id, {
          programId: program.id,
          name: program.name,
          courses: [],
        });
      }
      
      // Construir el objeto de curso
      const courseData = await this.buildCourseData(courseOffering);
      
      // Agregar el curso al programa correspondiente
      const programWithCourses = programsMap.get(courseOffering.programId);
      if (programWithCourses) {
        // Si es necesario verificar duplicados
        if (checkDuplicates) {
          const courseExists = programWithCourses.courses.some(course => course.courseId === courseData.courseId);
          if (!courseExists) {
            programWithCourses.courses.push(courseData);
          }
        } else {
          programWithCourses.courses.push(courseData);
        }
      }
    }

    return Array.from(programsMap.values());
  }

  /**
   * Ejecuta la consulta según el rol del usuario y organiza los resultados por programas
   */
  async execute(
    userId: string, 
    filters: CoursesByProgramTypeDto,
    roleName: string = UserRoles.STUDENT // Por defecto asumimos que es un estudiante
  ): Promise<CoursesByProgramTypeResponseDto> {
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    
    let totalCount = 0;
    let programs: ProgramWithCoursesDto[] = [];
    
    // Ejecutar la consulta según el rol del usuario
    if (roleName === UserRoles.TEACHER) {
      // Consulta para profesores usando block-assignments
      const query = this.buildTeacherQuery(userId, filters);
      totalCount = await query.getCount();
      query.skip(skip).take(limit);
      const blockAssignments = await query.getMany();
      programs = await this.processResults(
        blockAssignments, 
        (block) => block.courseOffering, 
        true // Verificar duplicados para profesores
      );
    } else {
      // Consulta para estudiantes usando enrollments (comportamiento por defecto)
      const query = this.buildStudentQuery(userId, filters);
      totalCount = await query.getCount();
      query.skip(skip).take(limit);
      const enrollments = await query.getMany();
      programs = await this.processResults(
        enrollments, 
        (enrollment) => enrollment.courseOffering,
        false // No es necesario verificar duplicados para estudiantes
      );
    }
    
    const totalPages = Math.ceil(totalCount / limit);
    
    // Crear el objeto de metadatos para la paginación
    const meta: MetaDto = {
      totalCount,
      page,
      limit,
      totalPages,
    };
    
    // Construir la respuesta final
    return {
      meta,
      programs,
    };
  }
}
