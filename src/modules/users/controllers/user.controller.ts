import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiCreateUser, ApiGetUser, ApiListUsers } from '../decorators/swagger.decorators';
import { User } from '../entities/user.entity';
import { FindUserQueryDto, FindUsersQueryDto } from '../dtos/user-request.dto';
import { CreateUserDto } from '../dtos/create-user.dto';

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
    return this.userService.findOne(userId, withRole);
  }

  @Post()
  @ApiCreateUser()
  async create(@Body() dto: CreateUserDto) {
    const { email } = await this.userService.create(dto);
    return {
      message: 'Usuario creado. Se envió invitación por email.',
      email,
    };
  }
}
