import { ApiProperty } from '@nestjs/swagger';
import { getSyllabusValidMimeTypesDescription } from '../../../utils/file-validation.utils';

export class UploadSyllabusDto {
  @ApiProperty({
    type: 'string',
    description: `Archivo del syllabus para el bloque (${getSyllabusValidMimeTypesDescription()})`,
    format: 'binary'
  })
  file: Express.Multer.File;
}
