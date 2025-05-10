import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './entities/block.entity';
import { BlockController } from './controllers/block.controller';
import { BlockService } from './services/block.service';
import { BLOCK_REPOSITORY } from './tokens/index';
import { TypeormBlocksRepository } from './repositories/typeorm-blocks.repository';
import { CourseOfferingModule } from '../course-offerings/course-offering.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Block]),
    CourseOfferingModule,
  ],
  controllers: [BlockController],
  providers: [
    BlockService,
    {
      provide: BLOCK_REPOSITORY,
      useClass: TypeormBlocksRepository,
    },
  ],
  exports: [BlockService, BLOCK_REPOSITORY],
})
export class BlocksModule {}