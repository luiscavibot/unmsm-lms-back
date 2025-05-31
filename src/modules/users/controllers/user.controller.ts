import { Body, Controller, Get, Param, Post, Query, UseInterceptors, UploadedFile, BadRequestException, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from '../services/user.service';
import { ApiCreateUser, ApiDeleteResume, ApiGetUser, ApiListUsers, ApiUploadResume } from '../decorators/swagger.decorators';
import { User } from '../entities/user.entity';
import { FindUserQueryDto, FindUsersQueryDto } from '../dtos/user-request.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ResumeUploadDto } from '../dtos/resume-upload.dto';
import { FilesService } from '../../files/services/files.service';
import { CurrentUserToken } from 'src/common/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/common/auth/interfaces';
import { BlockAssignmentService } from '../../block-assignments/services/block-assignment.service';
import { isValidResumeMimeType, RESUME_ALLOWED_MIME_TYPES } from '../../../utils/file-validation.utils';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly filesService: FilesService,
    private readonly blockAssignmentService: BlockAssignmentService,
  ) {}

  @Get()
  @ApiListUsers()
  async findAll(
    @Query() { limit = 20, nextToken, withRole = false }: FindUsersQueryDto,
  ): Promise<{ users: User[]; nextToken?: string }> {
    const lim = Math.min(limit, 100);
    return this.userService.findAll(lim, nextToken, withRole);
  }

  @Get(':userId')
  @ApiGetUser()
  async findOne(@Param('userId') userId: string, @Query() { withRole = false }: FindUserQueryDto): Promise<User> {
    return this.userService.findOne(userId, withRole);
  }

  @Post()
  @ApiCreateUser()
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }

  @Post('resume')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      if (isValidResumeMimeType(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException(`El archivo debe ser un ${RESUME_ALLOWED_MIME_TYPES.join(', ')}`), false);
      }
    },
  }))
  @ApiUploadResume()
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ResumeUploadDto,
    @CurrentUserToken() user: UserPayload,
  ): Promise<User> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    // Verificar que el archivo es un PDF o una imagen
    if (!isValidResumeMimeType(file.mimetype)) {
      throw new BadRequestException(`El archivo debe ser un PDF o una imagen (JPEG, PNG, GIF, WEBP, BMP, TIFF)`);
    }

    // Verificar que el usuario tiene asignación en el bloque especificado
    const blockAssignments = await this.blockAssignmentService.findByBlockId(dto.blockId);
    const userAssignment = blockAssignments.find(assignment => assignment.userId === user.userId);

    if (!userAssignment) {
      throw new ForbiddenException('No tienes permisos para subir un currículum para este bloque. Solo los profesores responsables o colaboradores pueden hacerlo.');
    }

    // Subir el archivo a la carpeta 'resumes/{userId}'
    const fileMetadata = await this.filesService.upload(file, user.userId, `resumes/${user.userId}`);
    
    // Generar URL del archivo y actualizar el atributo en Cognito
    const fileUrl = this.userService.getFileUrl(fileMetadata);
    await this.userService.updateUserAttribute(
      user.userId,
      'custom:resumeUrl',
      fileUrl,
    );

    // Actualizar la fecha de actualización del currículum
    const currentDate = new Date().toISOString();
    await this.userService.updateUserAttribute(
      user.userId,
      'custom:resumeDate',
      currentDate,
    );

    // Devolver el usuario actualizado
    return this.userService.findOne(user.userId);
  }

  @Post('resume/delete')
  @ApiDeleteResume()
  async deleteResume(
    @Body() dto: ResumeUploadDto,
    @CurrentUserToken() user: UserPayload,
  ): Promise<User> {
    // Verificar que el usuario tiene asignación en el bloque especificado
    const blockAssignments = await this.blockAssignmentService.findByBlockId(dto.blockId);
    const userAssignment = blockAssignments.find(assignment => assignment.userId === user.userId);

    if (!userAssignment) {
      throw new ForbiddenException('No tienes permisos para eliminar el currículum de este bloque. Solo los profesores responsables o colaboradores pueden hacerlo.');
    }

    // Eliminar el valor del atributo en Cognito
    await this.userService.updateUserAttribute(
      user.userId,
      'custom:resumeUrl',
      '',
    );
    
    // Eliminar también la fecha de actualización
    await this.userService.updateUserAttribute(
      user.userId,
      'custom:resumeDate',
      '',
    );

    // Devolver el usuario actualizado
    return this.userService.findOne(user.userId);
  }
}
