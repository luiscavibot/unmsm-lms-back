import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
  AdminGetUserCommandInput,
  GroupType,
  UserType,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  AdminUpdateUserAttributesCommand,
  AdminCreateUserCommandOutput,
  AdminCreateUserCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { mapUserFromCognito } from '../helpers/user.mappers';
import { CreateUserDto } from '../dtos/create-user.dto';
import * as generator from 'generate-password';
import { FileMetadata } from '../../files/entities/file-metadata.entity';

@Injectable()
export class UserService {
  private readonly cognito = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
  });

  constructor(private readonly config: ConfigService) {}

  async findAll(
    limit = 20,
    paginationToken?: string,
    withRole = false,
  ): Promise<{ users: User[]; nextToken?: string }> {
    try {
      const userPoolId = this.config.get<string>('COGNITO_USER_POOL_ID');
      const { Users: raw = [], PaginationToken: nextToken } = await this.cognito.send(
        new ListUsersCommand({ UserPoolId: userPoolId, Limit: limit, PaginationToken: paginationToken }),
      );

      const users = await Promise.all(raw.map((u) => this.buildUser(u, withRole)));
      return { users, nextToken };
    } catch (err) {
      throw new InternalServerErrorException('Error listando usuarios en Cognito', err);
    }
  }

  async findOne(userId: string, withRole = false): Promise<User> {
    const userPoolId = this.config.get<string>('COGNITO_USER_POOL_ID');
    const input: AdminGetUserCommandInput = { UserPoolId: userPoolId, Username: userId };

    try {
      const {
        Username,
        UserAttributes = [],
        Enabled,
        UserStatus,
      } = await this.cognito.send(new AdminGetUserCommand(input));

      if (!Username) {
        throw new NotFoundException(`Usuario '${userId}' no encontrado`);
      }

      const raw: UserType = {
        Username,
        Attributes: UserAttributes,
        Enabled: Enabled!,
        UserStatus: UserStatus!,
      } as UserType;

      return this.buildUser(raw, withRole);
    } catch (err: any) {
      if (err.name === 'UserNotFoundException') {
        throw new NotFoundException(`Usuario '${userId}' no existe`);
      }
      throw new InternalServerErrorException('Error obteniendo usuario de Cognito', err);
    }
  }

  private async buildUser(raw: UserType, withRole: boolean): Promise<User> {
    const userPoolId = this.config.get<string>('COGNITO_USER_POOL_ID');
    let groups: GroupType[] = [];

    if (withRole) {
      const { Groups = [] } = await this.cognito.send(
        new AdminListGroupsForUserCommand({ UserPoolId: userPoolId, Username: raw.Username! }),
      );
      groups = Groups;
    }

    return mapUserFromCognito(raw, groups);
  }

  async create(createUserDto: CreateUserDto): Promise<AdminCreateUserCommandOutput> {
    const userPoolId = this.config.get<string>('COGNITO_USER_POOL_ID');
    const { email, name, roleName } = createUserDto;

    const input: AdminCreateUserCommandInput = {
      UserPoolId: userPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'name', Value: name },
      ],
      DesiredDeliveryMediums: ['EMAIL'],
    };

    try {
      // 1) Crear usuario en Cognito
      const createCmd = new AdminCreateUserCommand(input);
      const response = await this.cognito.send(createCmd);

      // 2) Asignar al grupo según roleName
      if (roleName) {
        const addGroupCmd = new AdminAddUserToGroupCommand({
          UserPoolId: userPoolId,
          Username: email,
          GroupName: roleName,
        });
        await this.cognito.send(addGroupCmd);
      }

      return response;
    } catch (error: any) {
      console.error('Error creando usuario en Cognito:', error);
      if (error.name === 'UsernameExistsException') {
        throw new ConflictException('El usuario ya existe en Cognito');
      }
      throw new InternalServerErrorException('No se pudo crear usuario en Cognito');
    }
  }

  async updateUserAttribute(userId: string, attributeName: string, attributeValue: string): Promise<boolean> {
    const userPoolId = this.config.get<string>('COGNITO_USER_POOL_ID');

    try {
      await this.cognito.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: userPoolId,
          Username: userId,
          UserAttributes: [
            {
              Name: attributeName,
              Value: attributeValue,
            },
          ],
        }),
      );
      return true;
    } catch (err) {
      console.error(`Error actualizando atributo ${attributeName} para el usuario ${userId}:`, err);
      throw new InternalServerErrorException(`No se pudo actualizar el atributo ${attributeName}`, err);
    }
  }

  getFileUrl(fileMetadata: FileMetadata | string): string {
    const cdnUrl = this.config.get<string>('S3_CDN_URL') || this.config.get<string>('STORAGE_DOMAIN') || '';

    if (typeof fileMetadata === 'string') {
      // Si se proporciona directamente la ruta hasheada
      return `${cdnUrl}/${fileMetadata}`;
    } else {
      // Si se proporciona el objeto FileMetadata completo
      return `${cdnUrl}/${fileMetadata.hashedName}`;
    }
  }
}
