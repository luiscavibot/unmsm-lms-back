import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiExtraModels } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dtos/user-response.dto';
import { FindUserQueryDto } from '../dtos/user-request.dto';

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
