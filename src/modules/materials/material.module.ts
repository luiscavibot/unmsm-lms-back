import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { MaterialController } from './controllers/material.controller';
import { MaterialService } from './services/material.service';
import { TypeormMaterialsRepository } from './repositories/typeorm-materials.repository';
import { MATERIAL_REPOSITORY } from './tokens';
import { EnrollmentModule } from '../enrollments/enrollment.module';
import { ClassSessionModule } from '../class-sessions/class-session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material]),
    EnrollmentModule,
    ClassSessionModule,
  ],
  controllers: [MaterialController],
  providers: [
    MaterialService,
    {
      provide: MATERIAL_REPOSITORY,
      useClass: TypeormMaterialsRepository,
    },
  ],
  exports: [MaterialService],
})
export class MaterialModule {}
