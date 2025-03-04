import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FacultiesModule } from './modules/faculties/faculties.module';
import { DatabaseModule } from './database/database.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { CourseModule } from './modules/courses/course.module';
import { ProgramCourseModule } from './modules/program-courses/program-course.module';
import { ClassSessionModule } from './modules/class-sessions/class-session.module';

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
    CourseModule,
    ProgramCourseModule,
    ClassSessionModule,
  ],
})
export class AppModule {}
