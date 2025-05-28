import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { BlockAssignment } from '../../block-assignments/entities/block-assignment.entity';
import { BlockRolType } from '../../block-assignments/enums/block-rol-type.enum';
import { CourseDetailResponseDto } from '../dtos/course-detail-response.dto';
import { BlockType } from '../../blocks/enums/block-type.enum';
import { UserService } from '../../users/services/user.service';
import { User } from '../../users/entities/user.entity';
import { CourseUtils } from '../../../utils/course-utils';

@Injectable()
export class GetCourseDetailQuery {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(BlockAssignment)
    private readonly blockAssignmentRepository: Repository<BlockAssignment>,
    private readonly userService: UserService,
  ) {}

  /**
   * Obtiene la información básica del curso y la oferta
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
   */
  private async getBasicBlocksInfo(courseOfferingId: string) {
    return await this.blockAssignmentRepository
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
  async execute(courseOfferingId: string, userId: string): Promise<CourseDetailResponseDto> {
    // 1. Obtener información básica del curso y la oferta
    const enrollmentData = await this.getBasicCourseInfo(courseOfferingId, userId);

    // 2. Obtener el profesor responsable del curso
    const { teacherName, responsibleTeacher } = await this.getResponsibleTeacher(courseOfferingId);

    // 3. Obtener los bloques del curso
    const blocksQuery = await this.getBasicBlocksInfo(courseOfferingId);

    // 4. Para cada bloque, obtener información detallada
    const blocksDetails = await Promise.all(
      blocksQuery.map(async (block) => {
        return this.buildBlockDetails(block, courseOfferingId, responsibleTeacher);
      })
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
