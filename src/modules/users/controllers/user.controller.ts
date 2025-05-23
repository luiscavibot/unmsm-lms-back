import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiGetUser, ApiListUsers } from '../decorators/swagger.decorators';
import { User } from '../entities/user.entity';
import { FindUserQueryDto, FindUsersQueryDto } from '../dtos/user-request.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiListUsers()
  async findAll(
    @Query() { limit = 20, nextToken, withRole = false }: FindUsersQueryDto,
  ): Promise<{ users: User[]; nextToken?: string }> {
    const lim = Math.min(limit, 100);
    return this.userService.findAll(lim, nextToken, withRole);
  }

  @Get(':userId')
  @ApiGetUser()
  async findOne(@Param('userId') userId: string, @Query() { withRole = false }: FindUserQueryDto): Promise<User> {
    console.log('withRole en UserIs->', withRole);
    return this.userService.findOne(userId, withRole);
  }
}
