import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { CourseOffering } from '../../course-offerings/entities/course-offering.entity';
import { EnrollmentBlock } from '../../enrollment-blocks/entities/enrollment-block.entity';
import { FilesService } from '../../files/services/files.service';

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
    @InjectRepository(CourseOffering)
    private readonly courseOfferingRepository: Repository<CourseOffering>,
    @InjectRepository(EnrollmentBlock)
    private readonly enrollmentBlockRepository: Repository<EnrollmentBlock>,
    private readonly userService: UserService,
    private readonly filesService: FilesService,
    private readonly config: ConfigService,
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
      courseOfferingRepository,
      enrollmentBlockRepository,
      userService,
      filesService,
      config
    );
  }

  async create(course: Course): Promise<Course> {
    return await this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find();
  }

  async findOne(id: string): Promise<Course | null> {
    return await this.courseRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, course: Partial<Course>): Promise<Course | null> {
    await this.courseRepository.update(id, course);
    return await this.courseRepository.findOne({
      where: { id },
    });
  }

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
   * @param courseOfferingId ID de la oferta de curso
   * @param userId ID del usuario que realiza la consulta
   * @param roleName Rol del usuario (STUDENT o TEACHER)
   */
  async getCourseDetail(
    courseOfferingId: string, 
    userId: string, 
    roleName: string = UserRoles.STUDENT // Por defecto, asumimos que es un estudiante
  ): Promise<CourseDetailResponseDto> {
    return await this.getCourseDetailQuery.execute(courseOfferingId, userId, roleName);
  }
}
