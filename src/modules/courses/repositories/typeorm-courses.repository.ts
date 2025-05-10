import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { ICourseRepository } from '../interfaces/course.repository.interface';
import { CoursesByProgramTypeDto } from '../dtos/courses-by-program-type.dto';
import { CoursesByProgramTypeResponseDto, CourseDataDto, MetaDto, ProgramWithCoursesDto } from '../dtos/courses-by-program-type-response.dto';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { BlockAssignment } from '../../block-assignments/entities/block-assignment.entity';
import { BlockRolType } from '../../block-assignments/enums/block-rol-type.enum';

@Injectable()
export class TypeormCoursesRepository implements ICourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(BlockAssignment)
    private readonly blockAssignmentRepository: Repository<BlockAssignment>,
  ) {}

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
  
  async findCoursesByProgramType(userId: string, filters: CoursesByProgramTypeDto): Promise<CoursesByProgramTypeResponseDto> {
    const { 
      status, 
      programType, 
      semester, 
      page = 1, 
      limit = 20, 
      keyword 
    } = filters;
    
    // Calcular el offset para la paginación
    const skip = (page - 1) * limit;
    
    // Crear la consulta base para obtener todos los course offerings en los que está matriculado el usuario
    const query = this.enrollmentRepository.createQueryBuilder('enrollment')
      .where('enrollment.userId = :userId', { userId })
      .leftJoinAndSelect('enrollment.courseOffering', 'courseOffering')
      .leftJoinAndSelect('courseOffering.program', 'program')
      .leftJoinAndSelect('courseOffering.course', 'course')
      .leftJoinAndSelect('courseOffering.semester', 'semester');
    
    // Aplicar filtros según los parámetros recibidos
    if (status) {
      if (status === 'current') {
      query.andWhere('courseOffering.status IN (:...statuses)', { statuses: ['current', 'unstarted'] });
      } else {
      query.andWhere('courseOffering.status = :status', { status });
      }
    }
    
    if (programType) {
      query.andWhere('program.type = :programType', { programType });
    }
    
    if (semester) {
      query.andWhere('courseOffering.semesterId = :semester', { semester });
    }
    
    if (keyword) {
      query.andWhere(
        '(course.name LIKE :keyword OR program.name LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }
    
    // Obtener el total de registros para la paginación
    const totalCount = await query.getCount();
    const totalPages = Math.ceil(totalCount / limit);
    
    // Aplicar paginación
    query.skip(skip).take(limit);
    
    // Ejecutar la consulta
    const enrollments = await query.getMany();
    
    // Obtener los programas únicos de los course offerings
    const programs: Map<string, ProgramWithCoursesDto> = new Map();
    
    // Procesar cada enrollment para construir la respuesta
    for (const enrollment of enrollments) {
      const { courseOffering } = enrollment;
      
      // Verificar si ya tenemos el programa en el mapa
      if (!programs.has(courseOffering.programId)) {
        const program = courseOffering.program;
        programs.set(program.id, {
          programId: program.id,
          name: program.name,
          courses: []
        });
      }
      
      // Buscar el profesor responsable para este course offering
      const teacherAssignment = await this.blockAssignmentRepository
        .createQueryBuilder('blockAssignment')
        .where('blockAssignment.courseOfferingId = :courseOfferingId', { courseOfferingId: courseOffering.id })
        .andWhere('blockAssignment.blockRol = :blockRol', { blockRol: BlockRolType.RESPONSIBLE })
        .leftJoinAndSelect('blockAssignment.user', 'user')
        .getOne();
      
      // Crear el objeto de profesor
      const teacher = teacherAssignment ? {
        name: `${teacherAssignment.user.firstName} ${teacherAssignment.user.lastName}`,
        imgUrl: teacherAssignment.user.imgUrl || 'https://www.imagen.com'
      } : {
        name: 'Sin profesor asignado',
        imgUrl: 'https://www.imagen.com'
      };
      
      // Formatear las fechas
      const startDate = new Date(courseOffering.startDate);
      const endDate = new Date(courseOffering.endDate);
      
      // Construir el objeto de curso
      const courseData: CourseDataDto = {
        courseId: courseOffering.id,
        name: courseOffering.course.name,
        teacher,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        semester: courseOffering.semester.year + '-' + courseOffering.semester.name,
        module: courseOffering.module || '',
        unstarted: courseOffering.status === 'unstarted'
      };
      
      // Agregar el curso al programa correspondiente
      const programWithCourses = programs.get(courseOffering.programId);
      if (programWithCourses) {
        programWithCourses.courses.push(courseData);
      }
    }
    
    // Crear el objeto de metadatos para la paginación
    const meta: MetaDto = {
      totalCount,
      page,
      limit,
      totalPages
    };
    
    // Construir la respuesta final
    return {
      meta,
      programs: Array.from(programs.values())
    };
  }
}
