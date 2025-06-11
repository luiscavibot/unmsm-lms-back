import { ApiProperty } from '@nestjs/swagger';

export class ClassDaysResponseDto {
  @ApiProperty({
    description: 'Información de los días de clase para un bloque específico',
    type: [String]
  })
  classDays: String[];
}
