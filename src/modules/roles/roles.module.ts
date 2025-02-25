import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleController } from './controllers/role.controller';
import { RoleService } from './services/role.service';
import { ROLE_REPOSITORY } from './tokens/tokens';
import { TypeormRolesRepository } from './repositories/typeorm-roles.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RoleController],
  providers: [
    RoleService,
    {
      provide: ROLE_REPOSITORY,
      useClass: TypeormRolesRepository,
    },
  ],
  exports: [RoleService],
})
export class RolesModule {}
