import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'ID del rol del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@unmsm.edu.pe',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'URL de la imagen de perfil del usuario',
    example: 'https://example.com/profile.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  imgUrl?: string;

  @ApiProperty({
    description: 'URL del curriculum vitae del usuario',
    example: 'https://example.com/resume.pdf',
    required: false
  })
  @IsString()
  @IsOptional()
  resumeUrl?: string;
}
