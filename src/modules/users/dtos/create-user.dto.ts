import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'STUDENT', enum: ['STUDENT', 'TEACHER'] })
  @IsIn(['STUDENT', 'TEACHER'])
  roleName: 'STUDENT' | 'TEACHER';
}
