import { ApiProperty } from '@nestjs/swagger';

export class UploadSyllabusDto {
  @ApiProperty({
    type: 'string',
    description: 'El archivo PDF del syllabus para el bloque',
    format: 'binary'
  })
  file: Express.Multer.File;
}
