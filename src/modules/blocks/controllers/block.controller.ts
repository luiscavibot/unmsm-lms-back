import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlockService } from '../services/block.service';
import { Block } from '../entities/block.entity';
import { CreateBlockDto } from '../dtos/create-block.dto';
import { UpdateBlockDto } from '../dtos/update-block.dto';
import { UploadSyllabusDto } from '../dtos/upload-syllabus.dto';
import { CurrentUserToken } from '../../../common/auth/decorators/current-user.decorator';
import { UserPayload } from '../../../common/auth/interfaces';
import { JwtAuthGuard } from '../../../common/auth/guards/jwt-auth.guard';

@Controller('blocks')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los bloques o filtrar por courseOfferingId' })
  async findAll(
    @Query('courseOfferingId') courseOfferingId?: string,
  ): Promise<Block[]> {
    if (courseOfferingId) {
      return this.blockService.findByCourseOfferingId(courseOfferingId);
    }
    return this.blockService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un bloque por su ID' })
  async findById(@Param('id') id: string): Promise<Block> {
    return this.blockService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo bloque' })
  async create(@Body() createBlockDto: CreateBlockDto): Promise<Block> {
    return this.blockService.create(createBlockDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un bloque existente' })
  async update(
    @Param('id') id: string,
    @Body() updateBlockDto: UpdateBlockDto,
  ): Promise<Block> {
    return this.blockService.update(id, updateBlockDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un bloque por su ID' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.blockService.delete(id);
  }

  @Post(':id/syllabus')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir el syllabus de un bloque' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo PDF del syllabus para el bloque',
    type: UploadSyllabusDto,
  })
  async uploadSyllabus(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUserToken() user: UserPayload
  ): Promise<Block> {
    return this.blockService.uploadSyllabus(id, file, user.userId, user.rolName);
  }

  @Delete(':id/syllabus')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar el syllabus de un bloque' })
  @ApiResponse({
    status: 200,
    description: 'Syllabus eliminado correctamente',
    type: Block
  })
  async deleteSyllabus(
    @Param('id') id: string,
    @CurrentUserToken() user: UserPayload
  ): Promise<Block> {
    return this.blockService.deleteSyllabus(id, user.userId, user.rolName);
  }
}