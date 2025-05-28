import { Controller, Post, Get, Param, Delete, Put, UploadedFile, UseInterceptors, Req, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../services/files.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiFileUpload, ApiStandardResponses } from '../decorators/swagger.decorators';
import { UserPayload } from 'src/common/auth/interfaces';
import { CurrentUserToken } from 'src/common/auth/decorators/current-user.decorator';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiFileUpload('Upload a file')
  upload(@Body('path') path: string, @UploadedFile() file: Express.Multer.File, @CurrentUserToken() user: UserPayload) {
    return this.filesService.upload(file, user.userId, path);
  }

  @Get()
  @ApiStandardResponses('FileMetadata')
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  @ApiStandardResponses('FileMetadata')
  findOne(@Param('id') id: number) {
    return this.filesService.findOne(id);
  }

  @Delete(':id')
  @ApiStandardResponses('FileMetadata')
  remove(@Param('id') id: number) {
    return this.filesService.remove(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiFileUpload('Update an existing file')
  update(@Param('id') id: number, @UploadedFile() file: Express.Multer.File, @CurrentUserToken() user: UserPayload) {
    return this.filesService.update(id, file, user.userId);
  }
}
