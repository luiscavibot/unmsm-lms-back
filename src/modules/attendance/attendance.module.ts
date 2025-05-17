import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceService } from './services/attendance.service';
import { TypeormAttendanceRepository } from './repositories/typeorm-attendance.repository';
import { ATTENDANCE_REPOSITORY } from './tokens';
import { EnrollmentModule } from '../enrollments/enrollment.module';
import { ClassSessionModule } from '../class-sessions/class-session.module';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    EnrollmentModule,
    ClassSessionModule,
    BlocksModule,
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    {
      provide: ATTENDANCE_REPOSITORY,
      useClass: TypeormAttendanceRepository,
    },
  ],
  exports: [AttendanceService],
})
export class AttendanceModule {}
