import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiConsumes, ApiBody, getSchemaPath } from '@nestjs/swagger';

export function ApiFileUpload(description: string) {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: { type: 'string', format: 'binary' },
          path: { type: 'string', description: 'Optional folder path within bucket' },
        },
        required: ['file'],
      },
    }),
    ApiResponse({ status: 201, description: 'File uploaded successfully.' }),
  );
}

export function ApiStandardResponses(entity: string) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: `${entity} retrieved successfully.`,
      schema: { $ref: getSchemaPath(entity) },
    }),
    ApiResponse({ status: 404, description: `${entity} not found.` }),
    ApiResponse({ status: 500, description: 'Internal server error.' }),
  );
}
