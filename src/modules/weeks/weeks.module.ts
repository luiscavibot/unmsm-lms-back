import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Week } from './entities/week.entity';
import { WeekController } from './controllers/week.controller';
import { WeekService } from './services/week.service';
import { WEEK_REPOSITORY } from './tokens';
import { TypeormWeeksRepository } from './repositories/typeorm-weeks.repository';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Week]),
    BlocksModule,
  ],
  controllers: [WeekController],
  providers: [
    WeekService,
    {
      provide: WEEK_REPOSITORY,
      useClass: TypeormWeeksRepository,
    },
  ],
  exports: [WeekService],
})
export class WeeksModule {}
