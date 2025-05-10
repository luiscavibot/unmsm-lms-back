import { ApiProperty } from '@nestjs/swagger';

export class TeacherDto {
  @ApiProperty({
    description: 'Nombre completo del profesor',
    example: 'Eduardo Romero'
  })
  name: string;

  @ApiProperty({
    description: 'URL de la imagen del profesor',
    example: 'https://www.imagen.com'
  })
  imgUrl: string;
}

export class CourseDataDto {
  @ApiProperty({
    description: 'ID de la oferta de curso',
    example: 'abc123'
  })
  courseId: string;

  @ApiProperty({
    description: 'Nombre del curso',
    example: 'Bioinformática aplicada a la salud pública'
  })
  name: string;

  @ApiProperty({
    description: 'Información del profesor responsable',
    type: TeacherDto
  })
  teacher: TeacherDto;

  @ApiProperty({
    description: 'Fecha de inicio del curso',
    example: '2025-03-01'
  })
  startDate: string;

  @ApiProperty({
    description: 'Fecha de finalización del curso',
    example: '2025-09-24'
  })
  endDate: string;

  @ApiProperty({
    description: 'Semestre académico',
    example: '2025-I'
  })
  semester: string;

  @ApiProperty({
    description: 'Módulo al que pertenece el curso',
    example: 'Módulo I'
  })
  module: string;

  @ApiProperty({
    description: 'Verifica si el curso no ha comenzado',
    example: true
  })
  unstarted: boolean;
}

export class ProgramWithCoursesDto {
  @ApiProperty({
    description: 'ID del programa',
    example: '123'
  })
  programId: string;

  @ApiProperty({
    description: 'Nombre del programa',
    example: 'Bioinformática aplicada a la salud pública'
  })
  name: string;

  @ApiProperty({
    description: 'Lista de cursos en el programa',
    type: [CourseDataDto]
  })
  courses: CourseDataDto[];
}

export class MetaDto {
  @ApiProperty({
    description: 'Total de elementos',
    example: 100
  })
  totalCount: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Límite de elementos por página',
    example: 20
  })
  limit: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 5
  })
  totalPages: number;
}

export class CoursesByProgramTypeResponseDto {
  @ApiProperty({
    description: 'Metadatos de paginación',
    type: MetaDto
  })
  meta: MetaDto;

  @ApiProperty({
    description: 'Lista de programas con sus cursos',
    type: [ProgramWithCoursesDto]
  })
  programs: ProgramWithCoursesDto[];
}
