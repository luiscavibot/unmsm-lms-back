import { ApiProperty } from '@nestjs/swagger';
import { BlockType } from 'src/modules/blocks/enums/block-type.enum';

export class FileInfoDto {
  @ApiProperty({
    description: 'Nombre del archivo',
    example: 'syllabus-2025-I.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'URL para descargar el archivo',
    example: 'https://storage.example.com/files/asdf-asdf-asdf.pdf',
  })
  downloadUrl: string;

  @ApiProperty({
    description: 'Fecha de última actualización del archivo (solo para CV)',
    example: '2025-05-15T12:30:45.000Z',
    required: false,
  })
  updateDate?: string;
}

export class BlockScheduleDto {
  @ApiProperty({
    description: 'Día y horario de clase',
    example: 'Lunes: 9:00 - 11:00',
  })
  schedule: string;
}

export class BlockDetailDto {
  @ApiProperty({
    description: 'ID del bloque',
    example: 'asdfa-asdfa-asdfs',
  })
  blockId: string;

  @ApiProperty({
    description: 'Nombre del tipo de bloque (Nombre del grupo)',
    example: 'Practica (Grupo I)',
  })
  name: string;

  @ApiProperty({
    description: 'Nombre del tipo de bloque',
    enum: ['theory', 'practice'],
    example: 'practice',
  })
  blockType: BlockType;

  @ApiProperty({
    description: 'Horarios de clase',
    type: [String],
    example: ['Lunes: 9:00 - 11:00', 'Jueves: 21:00 - 22:30'],
  })
  schedule: string[];

  @ApiProperty({
    description: 'Número de aula',
    example: '234',
  })
  aula: string;

  @ApiProperty({
    description: 'Nombre del profesor del bloque (null si es responsable)',
    example: 'Claudio García',
    nullable: true,
  })
  teacher: string | null;

  @ApiProperty({
    description: 'Información del syllabo',
    type: FileInfoDto,
  })
  syllabus: FileInfoDto;

  @ApiProperty({
    description: 'Información del CV del profesor',
    type: FileInfoDto,
  })
  cv: FileInfoDto;

  @ApiProperty({
    description: 'URL de la sala virtual para la próxima clase',
    example: 'https://meet.google.com/dvf-dpjt-ntc',
  })
  meetUrl: string;
}

export class CourseDetailResponseDto {
  @ApiProperty({
    description: 'ID de la oferta del curso',
    example: 'asdf-asdf-asdf',
  })
  courseId: string;

  @ApiProperty({
    description: 'Nombre del curso',
    example: 'Bioinformática Aplicada a la Vigilancia Genómica',
  })
  name: string;

  @ApiProperty({
    description: 'Nombre del programa académico',
    example: 'Bioinformática aplicada a la salud pública',
  })
  programName: string;

  @ApiProperty({
    description: 'Fecha de inicio del curso',
    example: '2025-04-01',
  })
  startDate: string;

  @ApiProperty({
    description: 'Fecha de finalización del curso',
    example: '2025-06-16',
  })
  endDate: string;

  @ApiProperty({
    description: 'Semestre académico',
    example: '2025-I',
  })
  semester: string;

  @ApiProperty({
    description: 'Nombre del profesor responsable del curso',
    example: 'Eduardo Romero',
  })
  teacher: string;

  @ApiProperty({
    description: 'Nota final del curso',
    example: 13,
    nullable: true,
  })
  endNote: number | null;

  @ApiProperty({
    description: 'Bloques del curso',
    type: [BlockDetailDto],
  })
  blocks: BlockDetailDto[];
}
