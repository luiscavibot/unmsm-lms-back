import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateProfileImageDto {
  @ApiProperty({
    description: 'URL de la imagen de perfil',
    example: 'https://example.com/profile.jpg',
  })
  @IsString()
  @IsNotEmpty()
  imgUrl: string;
}
