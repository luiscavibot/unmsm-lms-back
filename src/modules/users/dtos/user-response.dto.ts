import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    type: [User],
    description: 'Lista de usuarios actualizada',
  })
  users: User[];

  @ApiPropertyOptional({
    description: 'Token para paginar la siguiente página de resultados',
    example: 'AAQA-EFRSURBSGdrQit2NG8wei9wakx6ZFh0LzF3TkRaUEpjZ2RyK3hs…',
  })
  nextToken?: string;
}
