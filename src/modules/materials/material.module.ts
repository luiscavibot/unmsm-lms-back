import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { MaterialController } from './controllers/material.controller';
import { MaterialService } from './services/material.service';
import { TypeormMaterialsRepository } from './repositories/typeorm-materials.repository';
import { MATERIAL_REPOSITORY } from './tokens';
import { WeeksModule } from '../weeks/weeks.module';
import { BlocksModule } from '../blocks/blocks.module';
import { UsersModule } from '../users/users.module';
import { StorageModule } from '../../common/storage/storage.module';
import { BlockAssignmentsModule } from '../block-assignments/block-assignments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material]),
    WeeksModule,
    BlocksModule,
    UsersModule,
    StorageModule,
    BlockAssignmentsModule,
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
