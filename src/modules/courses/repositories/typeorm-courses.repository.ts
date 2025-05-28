import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { ICourseRepository } from '../interfaces/course.repository.interface';
import { CoursesByProgramTypeDto } from '../dtos/courses-by-program-type.dto';
import { CoursesByProgramTypeResponseDto } from '../dtos/courses-by-program-type-response.dto';
import { CourseDetailResponseDto } from '../dtos/course-detail-response.dto';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { BlockAssignment } from '../../block-assignments/entities/block-assignment.entity';
import { UserService } from '../../users/services/user.service';
import { FindCoursesByProgramTypeQuery, UserRoles } from '../queries/find-courses-by-program-type.query';
import { GetCourseDetailQuery } from '../queries/get-course-detail.query';

/**
 * Implementación del repositorio de cursos con TypeORM
 */
@Injectable()
export class TypeormCoursesRepository implements ICourseRepository {
  private readonly findCoursesByProgramTypeQuery: FindCoursesByProgramTypeQuery;
  private readonly getCourseDetailQuery: GetCourseDetailQuery;

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(BlockAssignment)
    private readonly blockAssignmentRepository: Repository<BlockAssignment>,
    private readonly userService: UserService
  ) {
    // Inicializar los objetos de consulta
    this.findCoursesByProgramTypeQuery = new FindCoursesByProgramTypeQuery(
      enrollmentRepository,
      blockAssignmentRepository,
      userService
    );
    
    this.getCourseDetailQuery = new GetCourseDetailQuery(
      enrollmentRepository,
      blockAssignmentRepository,
      userService
    );
  }

  /**
   * Crea un nuevo curso
   */
  async create(course: Course): Promise<Course> {
    return await this.courseRepository.save(course);
  }

  /**
   * Encuentra todos los cursos
   */
  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find();
  }

  /**
   * Encuentra un curso por su ID
   */
  async findOne(id: string): Promise<Course | null> {
    return await this.courseRepository.findOne({
      where: { id },
    });
  }

  /**
   * Actualiza un curso existente
   */
  async update(id: string, course: Partial<Course>): Promise<Course | null> {
    await this.courseRepository.update(id, course);
    return await this.courseRepository.findOne({
      where: { id },
    });
  }

  /**
   * Elimina un curso por su ID
   */
  async delete(id: string): Promise<void> {
    await this.courseRepository.delete(id);
  }

  /**
   * Encuentra cursos por tipo de programa utilizando el patrón Query Object
   * @param userId ID del usuario que realiza la consulta
   * @param filters Filtros para la consulta
   * @param roleName Rol del usuario (STUDENT o TEACHER)
   */
  async findCoursesByProgramType(
    userId: string,
    filters: CoursesByProgramTypeDto,
    roleName: string = UserRoles.STUDENT // Por defecto, asumimos que es un estudiante
  ): Promise<CoursesByProgramTypeResponseDto> {
    return await this.findCoursesByProgramTypeQuery.execute(userId, filters, roleName);
  }

  /**
   * Obtiene los detalles de un curso utilizando el patrón Query Object
   */
  async getCourseDetail(courseOfferingId: string, userId: string): Promise<CourseDetailResponseDto> {
    return await this.getCourseDetailQuery.execute(courseOfferingId, userId);
  }
}
