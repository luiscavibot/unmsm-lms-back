import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentBlock } from './entities/enrollment-block.entity';
import { EnrollmentBlockController } from './controllers/enrollment-block.controller';
import { EnrollmentBlockService } from './services/enrollment-block.service';
import { TypeormEnrollmentBlocksRepository } from './repositories/typeorm-enrollment-blocks.repository';
import { ENROLLMENT_BLOCK_REPOSITORY } from './tokens';
import { EnrollmentModule } from '../enrollments/enrollment.module';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnrollmentBlock]),
    EnrollmentModule,
    BlocksModule,
  ],
  controllers: [EnrollmentBlockController],
  providers: [
    EnrollmentBlockService,
    {
      provide: ENROLLMENT_BLOCK_REPOSITORY,
      useClass: TypeormEnrollmentBlocksRepository,
    },
  ],
  exports: [EnrollmentBlockService],
})
export class EnrollmentBlockModule {}