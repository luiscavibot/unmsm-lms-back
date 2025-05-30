import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { USER_REPOSITORY } from './tokens';
import { TypeormUsersRepository } from './repositories/typeorm-users.repository';
import { RolesModule } from '../roles/roles.module';
import { FilesModule } from '../files/files.module';
import { BlockAssignmentsModule } from '../block-assignments/block-assignments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RolesModule,
    FilesModule,
    forwardRef(() => BlockAssignmentsModule)
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: TypeormUsersRepository,
    },
  ],
  exports: [UserService],
})
export class UsersModule {}
