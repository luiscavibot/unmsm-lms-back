import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FacultiesModule } from './modules/faculties/faculties.module';
import { DatabaseModule } from './database/database.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './common/auth/auth.module';
import { CourseModule } from './modules/courses/course.module';
import { ProgramCourseModule } from './modules/program-courses/program-course.module';
import { ClassSessionModule } from './modules/class-sessions/class-session.module';
import { EnrollmentModule } from './modules/enrollments/enrollment.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { MaterialModule } from './modules/materials/material.module';
import { SemestersModule } from './modules/semesters/semesters.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    FacultiesModule,
    ProgramsModule,
    RolesModule,
    UsersModule,
    AuthModule,
    CourseModule,
    ProgramCourseModule,
    ClassSessionModule,
    EnrollmentModule,
    AttendanceModule,
    MaterialModule,
    SemestersModule,
  ],
})
export class AppModule {}
