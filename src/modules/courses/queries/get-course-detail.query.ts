import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { BlockAssignment } from '../../block-assignments/entities/block-assignment.entity';
import { BlockRolType } from 'src/modules/block-assignments/enums/block-rol-type.enum';
import { CourseDetailResponseDto } from '../dtos/course-detail-response.dto';
import { BlockType } from '../../blocks/enums/block-type.enum';
import { UserService } from '../../users/services/user.service';
import { User } from '../../users/entities/user.entity';
import { CourseUtils } from '../../../utils/course-utils';
import { CourseOffering } from '../../course-offerings/entities/course-offering.entity';

export enum UserRoles {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

@Injectable()
export class GetCourseDetailQuery {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(BlockAssignment)
    private readonly blockAssignmentRepository: Repository<BlockAssignment>,
    @InjectRepository(CourseOffering)
    private readonly courseOfferingRepository: Repository<CourseOffering>,
    private readonly userService: UserService,
  ) {}

  /**
   * Obtiene la información básica del curso y la oferta para estudiantes
   */
  private async getBasicCourseInfo(courseOfferingId: string, userId: string) {
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

    return enrollmentData;
  }

  /**
   * Obtiene la información básica del curso y la oferta para profesores
   */
  private async getBasicCourseInfoForTeacher(courseOfferingId: string, userId: string) {
    // Verificar que el profesor esté asignado a este curso
    const teacherAssignment = await this.blockAssignmentRepository
      .createQueryBuilder('blockAssignment')
      .where('blockAssignment.userId = :userId', { userId })
      .andWhere('blockAssignment.courseOfferingId = :courseOfferingId', { courseOfferingId })
      .getOne();

    if (!teacherAssignment) {
      throw new NotFoundException(`El profesor no está asignado a este curso`);
    }

    // Obtener información básica del curso
    const courseOffering = await this.courseOfferingRepository
      .createQueryBuilder('courseOffering')
      .where('courseOffering.id = :courseOfferingId', { courseOfferingId })
      .leftJoinAndSelect('courseOffering.program', 'program')
      .leftJoinAndSelect('courseOffering.course', 'course')
      .leftJoinAndSelect('courseOffering.semester', 'semester')
      .getOne();

    if (!courseOffering) {
      throw new NotFoundException(`No se encontró la oferta de curso`);
    }

    return { courseOffering };
  }

  /**
   * Obtiene el profesor responsable del curso
   */
  private async getResponsibleTeacher(courseOfferingId: string) {
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
        responsibleTeacher = await this.userService.findOne(teacherAssignment.userId);
        teacherName = responsibleTeacher.name;
        teacherResumeUrl = responsibleTeacher.resumeUrl || '';
      } catch (error) {
        console.error('Error al obtener información del profesor:', error);
      }
    }

    return { teacherName, teacherResumeUrl, responsibleTeacher };
  }

  /**
   * Obtiene los bloques básicos del curso
   * @param courseOfferingId ID de la oferta de curso
   * @param userId ID del usuario (usado solo cuando el rol es TEACHER)
   * @param roleName Rol del usuario (STUDENT o TEACHER)
   */
  private async getBasicBlocksInfo(courseOfferingId: string, userId?: string, roleName?: string) {
    // Consulta base
    let query = this.blockAssignmentRepository
      .createQueryBuilder('blockAssignment')
      .distinctOn(['block.id'])
      .select('block.id', 'blockId')
      .addSelect('block.type', 'type')
      .addSelect('block.group', 'group')
      .addSelect('block.classroomNumber', 'aula')
      .addSelect('block.syllabusUrl', 'syllabusUrl')
      .innerJoin('blockAssignment.block', 'block')
      .where('blockAssignment.courseOfferingId = :courseOfferingId', { courseOfferingId });
    
    // Si es profesor, aplicamos filtros adicionales según su rol
    if (roleName === UserRoles.TEACHER && userId) {
      // Primero verificamos si es profesor responsable
      const isResponsible = await this.blockAssignmentRepository.findOne({
        where: {
          userId,
          courseOfferingId,
          blockRol: BlockRolType.RESPONSIBLE
        }
      });
      
      // Si no es responsable, solo mostramos los bloques donde está como colaborador
      if (!isResponsible) {
        query.andWhere('blockAssignment.userId = :userId', { userId });
      }
    }
    
    return await query.getRawMany();
  }

  /**
   * Obtiene la información del profesor del bloque
   */
  private async getBlockTeacherInfo(blockId: string, courseOfferingId: string, responsibleTeacher: User | null) {
    const blockTeacherAssignment = await this.blockAssignmentRepository.findOne({
      where: {
        blockId,
        courseOfferingId,
        blockRol: BlockRolType.COLLABORATOR
      }
    });

    let blockTeacherName: string | null = null;
    let teacherCvUrl: string = '';

    if (blockTeacherAssignment) {
      try {
        const blockTeacherUser = await this.userService.findOne(blockTeacherAssignment.userId);
        blockTeacherName = blockTeacherUser.name;
        teacherCvUrl = blockTeacherUser.resumeUrl || '';
      } catch (error) {
        console.error('Error al obtener información del profesor del bloque:', error);
      }
    } else if (responsibleTeacher) {
      teacherCvUrl = responsibleTeacher.resumeUrl || '';
    }

    return { blockTeacherName, teacherCvUrl };
  }

  /**
   * Obtiene las sesiones de clase para un bloque en la semana actual
   */
  private async getCurrentWeekSessions(blockId: string) {
    const now = new Date();
    
    // Obtener el primer día de la semana (lunes)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // Obtener el último día de la semana (domingo)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(11, 59, 59, 999);

    return await this.blockAssignmentRepository
      .createQueryBuilder('blockAssignment')
      .select('classSession.id', 'id')
      .addSelect('classSession.sessionDate', 'sessionDate')
      .addSelect('classSession.startTime', 'startTime')
      .addSelect('classSession.endTime', 'endTime')
      .addSelect('classSession.virtualRoomUrl', 'virtualRoomUrl')
      .innerJoin('blockAssignment.block', 'block')
      .innerJoin('class_sessions', 'classSession', 'classSession.blockId = block.id')
      .where('blockAssignment.blockId = :blockId', { blockId })
      .andWhere('classSession.sessionDate BETWEEN :startDate AND :endDate', {
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0],
      })
      .orderBy('classSession.sessionDate', 'ASC')
      .addOrderBy('classSession.startTime', 'ASC')
      .getRawMany();
  }

  /**
   * Formatea los horarios de las sesiones
   */
  private formatSchedules(classSessions: any[]) {
    return classSessions.map((session) => {
      const sessionDate = new Date(session.sessionDate);
      const dayName = CourseUtils.getDayName(sessionDate);
      const formattedDate = CourseUtils.formatDate(sessionDate);
      return `${dayName} ${formattedDate} / ${CourseUtils.formatTime(session.startTime)} - ${CourseUtils.formatTime(session.endTime)}`;
    });
  }

  /**
   * Encuentra la URL de la próxima sesión virtual
   */
  private findNextSessionUrl(classSessions: any[]): string {
    const now = new Date();
    
    const nextSession = classSessions.find((session) => {
      const sessionDate = new Date(session.sessionDate + 'T' + session.startTime);
      return sessionDate >= now;
    });

    if (nextSession) {
      return nextSession.virtualRoomUrl || '';
    } else if (classSessions.length > 0) {
      return classSessions[classSessions.length - 1].virtualRoomUrl || '';
    }
    
    return '';
  }

  /**
   * Construye los detalles completos de un bloque
   */
  private async buildBlockDetails(block: any, courseOfferingId: string, responsibleTeacher: User | null) {
    // Obtener información del profesor del bloque
    const { blockTeacherName, teacherCvUrl } = await this.getBlockTeacherInfo(
      block.blockId, 
      courseOfferingId, 
      responsibleTeacher
    );

    // Obtener sesiones de clase de la semana actual
    const classSessions = await this.getCurrentWeekSessions(block.blockId);

    // Formatear los horarios
    const schedules = this.formatSchedules(classSessions);

    // Encontrar la URL de la próxima sesión
    const meetUrl = this.findNextSessionUrl(classSessions);

    // Formatear nombre del bloque
    const blockTypeName = CourseUtils.blockTypeName(block.type);
    const blockGroupName = block?.type === BlockType.PRACTICE ? ` - Grupo ${block.group}` : '';
    const blockName = blockTypeName + blockGroupName;

    // Extraer nombres de archivo de las URLs
    const syllabusFileName = CourseUtils.extractFileNameFromUrl(block.syllabusUrl);
    const cvFileName = CourseUtils.extractFileNameFromUrl(teacherCvUrl);

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
  }

  /**
   * Ejecuta la consulta para obtener los detalles completos del curso
   */
  async execute(courseOfferingId: string, userId: string, roleName: string = UserRoles.STUDENT): Promise<CourseDetailResponseDto> {
    let courseName: string;
    let programName: string;
    let startDate: string;
    let endDate: string;
    let semester: string;
    let teacherName: string;
    let endNote: number | null = null;

    if (roleName === UserRoles.TEACHER) {
      // Flujo para profesores
      const { courseOffering } = await this.getBasicCourseInfoForTeacher(courseOfferingId, userId);
      
      courseName = courseOffering.course.name;
      programName = courseOffering.program.name;
      startDate = courseOffering.startDate.toISOString().split('T')[0];
      endDate = courseOffering.endDate.toISOString().split('T')[0];
      semester = `${courseOffering.semester.year}-${courseOffering.semester.name}`;
      
      // Obtener el profesor responsable
      const { teacherName: responsibleTeacher } = await this.getResponsibleTeacher(courseOfferingId);
      teacherName = responsibleTeacher;
      
    } else {
      // Flujo para estudiantes (original)
      const enrollmentData = await this.getBasicCourseInfo(courseOfferingId, userId);
      
      courseName = enrollmentData.courseOffering.course.name;
      programName = enrollmentData.courseOffering.program.name;
      startDate = enrollmentData.courseOffering.startDate.toISOString().split('T')[0];
      endDate = enrollmentData.courseOffering.endDate.toISOString().split('T')[0];
      semester = `${enrollmentData.courseOffering.semester.year}-${enrollmentData.courseOffering.semester.name}`;
      endNote = enrollmentData.finalAverage;
      
      // Obtener el profesor responsable
      const { teacherName: responsibleTeacher } = await this.getResponsibleTeacher(courseOfferingId);
      teacherName = responsibleTeacher;
    }

    // Obtener el profesor responsable del curso para usar en la construcción de bloques
    const { responsibleTeacher } = await this.getResponsibleTeacher(courseOfferingId);

    // Obtener los bloques del curso
    const blocksQuery = await this.getBasicBlocksInfo(courseOfferingId, userId, roleName);

    // Para cada bloque, obtener información detallada
    const blocksDetails = await Promise.all(
      blocksQuery.map(async (block) => {
        return this.buildBlockDetails(block, courseOfferingId, responsibleTeacher);
      })
    );

    // Armar la respuesta completa
    return {
      courseId: courseOfferingId,
      name: courseName,
      programName: programName,
      startDate: startDate,
      endDate: endDate,
      semester: semester,
      teacher: teacherName,
      endNote: endNote,
      blocks: blocksDetails,
    };
  }
}