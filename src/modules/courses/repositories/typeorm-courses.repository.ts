import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { ICourseRepository } from '../interfaces/course.repository.interface';
import { CoursesByProgramTypeDto } from '../dtos/courses-by-program-type.dto';
import {
  CoursesByProgramTypeResponseDto,
  CourseDataDto,
  MetaDto,
  ProgramWithCoursesDto,
} from '../dtos/courses-by-program-type-response.dto';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { BlockAssignment } from '../../block-assignments/entities/block-assignment.entity';
import { BlockRolType } from '../../block-assignments/enums/block-rol-type.enum';
import { CourseDetailResponseDto } from '../dtos/course-detail-response.dto';
import { BlockType, BlockTypeInSpanish } from 'src/modules/blocks/enums/block-type.enum';
import { UserService } from '../../users/services/user.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class TypeormCoursesRepository implements ICourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(BlockAssignment)
    private readonly blockAssignmentRepository: Repository<BlockAssignment>,
    private readonly userService: UserService
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

  async findCoursesByProgramType(
    userId: string,
    filters: CoursesByProgramTypeDto,
  ): Promise<CoursesByProgramTypeResponseDto> {
    const { status, programType, semester, page = 1, limit = 20, keyword } = filters;

    // Calcular el offset para la paginación
    const skip = (page - 1) * limit;

    // Crear la consulta base para obtener todos los course offerings en los que está matriculado el usuario
    const query = this.enrollmentRepository
      .createQueryBuilder('enrollment')
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
      // Si se proporciona un semestre específico, filtrar por ese semestre
      query.andWhere('courseOffering.semesterId = :semester', { semester });
    } else {
      // Si no se proporciona un semestre, filtrar por los últimos 2 años (similar a by-user/enrolled)
      const actualYear = new Date().getFullYear();
      const lastYear = actualYear - 1;
      query.andWhere('semester.year >= :lastYear AND semester.year <= :actualYear', {
        lastYear,
        actualYear,
      });
    }

    if (keyword) {
      query.andWhere('(course.name LIKE :keyword OR program.name LIKE :keyword)', { keyword: `%${keyword}%` });
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
          courses: [],
        });
      }

      // Buscar el profesor responsable para este course offering
      const teacherAssignment = await this.blockAssignmentRepository.findOne({
        where: { 
          courseOfferingId: courseOffering.id,
          blockRol: BlockRolType.RESPONSIBLE 
        }
      });

      // Crear el objeto de profesor
      let teacher = {
        name: 'Sin profesor asignado',
        imgUrl: 'https://www.imagen.com',
      };

      if (teacherAssignment) {
        try {
          // Obtener la información del usuario desde Cognito
          const user = await this.userService.findOne(teacherAssignment.userId);
          teacher = {
            name: user.name,
            imgUrl: user.imgUrl || 'https://www.imagen.com',
          };
        } catch (error) {
          console.error('Error al obtener información del usuario:', error);
        }
      }

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
        unstarted: courseOffering.status === 'unstarted',
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
      totalPages,
    };

    // Construir la respuesta final
    return {
      meta,
      programs: Array.from(programs.values()),
    };
  }

  blockTypeName(blockType: BlockType): string {
    switch (blockType) {
      case BlockType.THEORY:
        return BlockTypeInSpanish.THEORY;
      default:
        return BlockTypeInSpanish.PRACTICE;
    }
  }

  extractFileNameFromUrl(url: string): string {
    if (!url) return '';

    try {
      const urlWithoutParams = url.split('?')[0];
      const segments = urlWithoutParams.split('/');
      const fileName = segments[segments.length - 1];
      return decodeURIComponent(fileName);
    } catch (error) {
      return '';
    }
  }

  async getCourseDetail(courseOfferingId: string, userId: string): Promise<CourseDetailResponseDto> {
    // 1. Obtener información básica del curso y la oferta
    const courseOfferingQuery = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .where('enrollment.userId = :userId', { userId })
      .andWhere('enrollment.courseOfferingId = :courseOfferingId', { courseOfferingId })
      .leftJoinAndSelect('enrollment.courseOffering', 'courseOffering')
      .leftJoinAndSelect('courseOffering.program', 'program')
      .leftJoinAndSelect('courseOffering.course', 'course')
      .leftJoinAndSelect('courseOffering.semester', 'semester');

    const enrollmentData = await courseOfferingQuery.getOne();

    if (!enrollmentData) {
      throw new NotFoundException(`No se encontró matrícula para el usuario`);
    }

    // 2. Obtener el profesor responsable del curso
    const teacherAssignment = await this.blockAssignmentRepository.findOne({
      where: {
        courseOfferingId,
        blockRol: BlockRolType.RESPONSIBLE
      }
    });

    let teacherName = 'Sin profesor asignado';
    let teacherResumeUrl = '';
    let responsibleTeacher: User | null = null;
    
    if (teacherAssignment) {
      try {
        // Obtener la información del usuario desde Cognito
        responsibleTeacher = await this.userService.findOne(teacherAssignment.userId);
        teacherName = responsibleTeacher.name;
        teacherResumeUrl = responsibleTeacher.resumeUrl || '';
      } catch (error) {
        console.error('Error al obtener información del profesor:', error);
      }
    }

    // 3. Obtener los bloques del curso
    const blocksQuery = await this.blockAssignmentRepository
      .createQueryBuilder('blockAssignment')
      .distinctOn(['block.id'])
      .select('block.id', 'blockId')
      .addSelect('block.type', 'type')
      .addSelect('block.group', 'group')
      .addSelect('block.classroomNumber', 'aula')
      .addSelect('block.syllabusUrl', 'syllabusUrl')
      .innerJoin('blockAssignment.block', 'block')
      .where('blockAssignment.courseOfferingId = :courseOfferingId', { courseOfferingId })
      .getRawMany();

    // 4. Para cada bloque, obtener información detallada, incluyendo horarios y profesores
    const now = new Date();
    const blocksDetails = await Promise.all(
      blocksQuery.map(async (block) => {
        // Obtener información del profesor del bloque (si es collaborator)
        const blockTeacherAssignment = await this.blockAssignmentRepository.findOne({
          where: {
            blockId: block.blockId,
            courseOfferingId: courseOfferingId,
            blockRol: BlockRolType.COLLABORATOR
          }
        });

        let blockTeacherName: string | null = null;
        let teacherCvUrl: string = '';


        // Si hay un profesor colaborador para este bloque, usar su información
        if (blockTeacherAssignment) {
          try {
            const blockTeacherUser = await this.userService.findOne(blockTeacherAssignment.userId);
            blockTeacherName = blockTeacherUser.name;
            teacherCvUrl = blockTeacherUser.resumeUrl || '';
          } catch (error) {
            console.error('Error al obtener información del profesor del bloque:', error);
          }
        } else if (responsibleTeacher) {
          // Si no hay colaborador, usar la información del responsable para el CV
          teacherCvUrl = responsibleTeacher.resumeUrl || '';
        }

        // Determinar la semana actual
        // Obtener el primer día de la semana (lunes)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0, 0, 0, 0);

        // Obtener el último día de la semana (domingo)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Obtener las sesiones de clase para este bloque en la semana actual
        const classSessions = await this.blockAssignmentRepository
          .createQueryBuilder('blockAssignment')
          .select('classSession.id', 'id')
          .addSelect('classSession.sessionDate', 'sessionDate')
          .addSelect('classSession.startTime', 'startTime')
          .addSelect('classSession.endTime', 'endTime')
          .addSelect('classSession.virtualRoomUrl', 'virtualRoomUrl')
          .innerJoin('blockAssignment.block', 'block')
          .innerJoin('class_sessions', 'classSession', 'classSession.blockId = block.id')
          .where('blockAssignment.blockId = :blockId', { blockId: block.blockId })
          .andWhere('classSession.sessionDate BETWEEN :startDate AND :endDate', {
            startDate: startOfWeek.toISOString().split('T')[0],
            endDate: endOfWeek.toISOString().split('T')[0],
          })
          .orderBy('classSession.sessionDate', 'ASC')
          .addOrderBy('classSession.startTime', 'ASC')
          .getRawMany();

        // Formatear los horarios
        const schedules = classSessions.map((session) => {
          const sessionDate = new Date(session.sessionDate);
          const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          const dayName = dayNames[sessionDate.getDay()];
          return `${dayName}: ${session.startTime.substring(0, 5)} - ${session.endTime.substring(0, 5)}`;
        });

        // Encontrar la próxima sesión para obtener la URL de la sala virtual
        let meetUrl = '';
        const nextSession = classSessions.find((session) => {
          const sessionDate = new Date(session.sessionDate + 'T' + session.startTime);
          return sessionDate >= now;
        });

        if (nextSession) {
          meetUrl = nextSession.virtualRoomUrl || '';
        } else if (classSessions.length > 0) {
          // Si no hay próximas sesiones, usar la URL de la última sesión
          meetUrl = classSessions[classSessions.length - 1].virtualRoomUrl || '';
        }

        // Formatear nombre del bloque
        const blockTypeName = this.blockTypeName(block.type);
        const blockGroupName = block?.type === BlockType.PRACTICE ? ` - Grupo ${block.group}` : '';
        const blockName = blockTypeName + blockGroupName;

        // Extraer nombres de archivo de las URLs
        const syllabusFileName = this.extractFileNameFromUrl(block.syllabusUrl);
        const cvFileName = this.extractFileNameFromUrl(teacherCvUrl);

        // Crear el objeto de detalle del bloque
        return {
          blockId: block.blockId,
          blockType: block.type,
          name: blockName,
          schedule: schedules,
          aula: block.aula || '',
          teacher: blockTeacherName,
          syllabus: {
            fileName: syllabusFileName,
            downloadUrl: block.syllabusUrl || '',
          },
          cv: {
            fileName: cvFileName,
            downloadUrl: teacherCvUrl,
          },
          meetUrl: meetUrl,
        };
      }),
    );

    // 5. Armar la respuesta completa
    return {
      courseId: courseOfferingId,
      name: enrollmentData.courseOffering.course.name,
      programName: enrollmentData.courseOffering.program.name,
      startDate: enrollmentData.courseOffering.startDate.toISOString().split('T')[0],
      endDate: enrollmentData.courseOffering.endDate.toISOString().split('T')[0],
      semester: `${enrollmentData.courseOffering.semester.year}-${enrollmentData.courseOffering.semester.name}`,
      teacher: teacherName,
      endNote: enrollmentData.finalAverage,
      blocks: blocksDetails,
    };
  }
}
