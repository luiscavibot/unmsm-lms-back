import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiExtraModels, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dtos/user-response.dto';
import { FindUserQueryDto } from '../dtos/user-request.dto';
import { User } from '../entities/user.entity';
import { ResumeUploadDto } from '../dtos/resume-upload.dto';

export function ApiListUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all users' }),
    ApiResponse({ status: 200, type: UserResponseDto }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de resultados por página' }),
    ApiQuery({
      name: 'nextToken',
      required: false,
      type: String,
      description: 'Token de paginación para la siguiente página',
    }),
    ApiQuery({ name: 'withRole', required: false, type: Boolean, description: 'Incluir información de roles' }),
  );
}

export function ApiGetUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a single user by username' }),
    ApiResponse({ status: 200, type: UserResponseDto }),
    ApiParam({ name: 'username', type: String, description: 'Username único del usuario en Cognito' }),
    ApiQuery({
      name: 'withRole',
      required: false,
      type: Boolean,
      description: 'Incluir información de roles',
    }),
    ApiExtraModels(FindUserQueryDto),
  );
}

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo usuario y enviar invitación por email' }),
    ApiResponse({
      status: 201,
      description: 'Usuario creado correctamente',
      schema: {
        properties: {
          message: { type: 'string', example: 'Usuario creado. Se envió invitación por email.' },
          email: { type: 'string', example: 'usuario@ejemplo.com' },
        },
      },
    }),
  );
}

export const ApiUploadResume = () =>
  applyDecorators(
    ApiOperation({ summary: 'Subir currículum del usuario para un bloque específico' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Archivo PDF o imagen (JPEG, PNG, GIF, WEBP, BMP, TIFF, SVG) del currículum',
          },
          blockId: {
            type: 'string',
            description: 'ID del bloque al que está asociado el profesor',
          },
        },
        required: ['file', 'blockId'],
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Currículum subido y perfil actualizado correctamente',
      type: User,
    }),
    ApiResponse({
      status: 403,
      description: 'Prohibido: El usuario no tiene asignación en el bloque especificado',
    }),
  );

export const ApiDeleteResume = () =>
  applyDecorators(
    ApiOperation({ summary: 'Eliminar currículum del usuario para un bloque específico' }),
    ApiBody({
      type: ResumeUploadDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Currículum eliminado correctamente',
      type: User,
    }),
    ApiResponse({
      status: 403,
      description: 'Prohibido: El usuario no tiene asignación en el bloque especificado',
    }),
  );
