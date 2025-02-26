import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FacultiesModule } from './modules/faculties/faculties.module';
import { DatabaseModule } from './database/database.module';
import { ProgramsModule } from './modules/programs/programs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    FacultiesModule,
    ProgramsModule,
  ],
})
export class AppModule {}
