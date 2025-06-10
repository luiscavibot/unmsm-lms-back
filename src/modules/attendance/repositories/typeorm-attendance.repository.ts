import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, EntityManager, DataSource } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { IAttendanceRepository } from '../interfaces/attendance.repository.interface';
import { AttendanceByWeekResponseDto, WeekAttendanceDto } from '../dtos/attendance-by-week-response.dto';

@Injectable()
export class TypeormAttendanceRepository implements IAttendanceRepository {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly dataSource: DataSource,
  ) {}

  async create(attendance: Attendance): Promise<Attendance> {
    return await this.attendanceRepository.save(attendance);
  }

  async findAll(): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      relations: ['enrollment', 'classSession'],
    });
  }

  async findOne(id: string): Promise<Attendance | null> {
    return await this.attendanceRepository.findOne({
      where: { id },
      relations: ['enrollment', 'classSession'],
    });
  }

  async update(id: string, attendance: Partial<Attendance>): Promise<Attendance | null> {
    await this.attendanceRepository.update(id, attendance);
    return await this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.attendanceRepository.delete(id);
  }

  async findByEnrollmentAndSession(enrollmentId: string, classSessionId: string): Promise<Attendance | null> {
    return await this.attendanceRepository.findOne({
      where: {
        enrollmentId,
        classSessionId,
      },
    });
  }

  async withTransaction<T>(runInTransaction: (entityManager: EntityManager) => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await runInTransaction(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findManyByClassSessionAndEnrollments(
    classSessionId: string,
    enrollmentIds: string[],
  ): Promise<Map<string, Attendance>> {
    // Optimización: solo hacer la consulta si hay enrollmentIds
    if (!enrollmentIds.length) {
      return new Map<string, Attendance>();
    }

    const attendances = await this.attendanceRepository.find({
      where: {
        classSessionId,
        enrollmentId: In(enrollmentIds), // Usar In de TypeORM
      },
    });

    // Crear un mapa indexado por enrollmentId para acceso rápido
    const attendanceMap = new Map<string, Attendance>();
    for (const attendance of attendances) {
      attendanceMap.set(attendance.enrollmentId, attendance);
    }

    return attendanceMap;
  }

  async createOrUpdateMany(
    attendances: {
      enrollmentId: string;
      classSessionId: string;
      status: string;
      id?: string;
      attendanceDate?: Date;
    }[],
  ): Promise<Attendance[]> {
    // Si no hay registros para guardar, retornar un array vacío
    if (!attendances.length) {
      return [];
    }

    // Ejecutar en una transacción para garantizar atomicidad
    return await this.withTransaction(async (entityManager) => {
      // Convertir los objetos planos a entidades Attendance
      const attendanceEntities = attendances.map((attendance) => {
        const entity = new Attendance();
        if (attendance.id) entity.id = attendance.id;
        entity.enrollmentId = attendance.enrollmentId;
        entity.classSessionId = attendance.classSessionId;
        entity.status = attendance.status as any; // Necesario para el enum
        entity.attendanceDate = attendance.attendanceDate || new Date();
        return entity;
      });

      // Usar el entityManager proporcionado por la transacción
      return await entityManager.save(Attendance, attendanceEntities);
    });
  }

  async findAttendancesByBlockId(blockId: string, enrollmentId?: string): Promise<AttendanceByWeekResponseDto> {
    try {
      // Query para obtener todas las asistencias relacionadas a este bloque
      const query = this.attendanceRepository
        .createQueryBuilder('attendance')
        .innerJoin('attendance.classSession', 'classSession')
        .innerJoin('classSession.block', 'block')
        .innerJoin('classSession.week', 'week')
        .innerJoin('attendance.enrollment', 'enrollment')
        .where('block.id = :blockId', { blockId });

      // Si se proporciona un enrollmentId, filtrar solo las asistencias de ese estudiante
      if (enrollmentId) {
        query.andWhere('attendance.enrollmentId = :enrollmentId', { enrollmentId });
      }

      query
        .select([
          'attendance.id',
          'attendance.status',
          'attendance.attendanceDate',
          'classSession.sessionDate',
          'classSession.id',
          'week.id',
          'week.number',
        ])
        .orderBy('classSession.sessionDate', 'ASC');

      const attendances = await query.getMany();

      if (!attendances || attendances.length === 0) {
        return {
          attendancePercentage: '0%',
          weeks: [],
        };
      }

      // Calcular porcentaje de asistencia
      const totalAttendances = attendances.length;
      const presentAttendances = attendances.filter(
        (a) => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'JUSTIFIED',
      ).length;

      const attendancePercentage = Math.round((presentAttendances / totalAttendances) * 100) + '%';

      // Agrupar por semanas
      const weekAttendancesMap = new Map<string, WeekAttendanceDto>();

      for (const attendance of attendances) {
        try {
          const weekId = attendance.classSession?.week?.id;
          const weekNumber = attendance.classSession?.week?.number;

          if (!weekId || weekNumber === undefined || !attendance.classSession?.sessionDate) {
            continue; // Saltar este registro si falta información crucial
          }

          const sessionDate = new Date(attendance.classSession.sessionDate);
          const weekName = `Semana ${weekNumber}`;

          if (!weekAttendancesMap.has(weekId)) {
            weekAttendancesMap.set(weekId, {
              weekId,
              weekName,
              weekNumber,
              attendances: [],
            });
          }

          // Formatear fechas de manera segura
          let dateStr = '';
          let formattedDate = '';

          try {
            dateStr = sessionDate.toLocaleDateString('es-ES');
            formattedDate = sessionDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
          } catch (e) {
            // En caso de error con el formato de fecha, usar un formato sencillo
            dateStr = sessionDate.toISOString().split('T')[0];
            formattedDate = dateStr;
          }

          const formattedDateCapitalized = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

          const weekData = weekAttendancesMap.get(weekId);
          if (weekData) {
            weekData.attendances.push({
              date: dateStr,
              formattedDate: formattedDateCapitalized,
              status: attendance.status,
            });
          }
        } catch (error) {
          // Ignorar entradas problemáticas
          console.error('Error procesando asistencia:', error);
          continue;
        }
      }

      // Convertir el mapa a un array y ordenar por número de semana descendentemente
      const weeks: WeekAttendanceDto[] = Array.from(weekAttendancesMap.values()).sort(
        (a, b) => b.weekNumber - a.weekNumber,
      );

      return {
        attendancePercentage,
        weeks,
      };
    } catch (error) {
      console.error('Error obteniendo asistencias por bloque:', error);
      return {
        attendancePercentage: '0%',
        weeks: [],
      };
    }
  }
}
