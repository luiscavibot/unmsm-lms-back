import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
  AdminGetUserCommandInput,
  GroupType,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { mapUserFromCognito } from '../helpers/user.mappers';

@Injectable()
export class UserService {
  private readonly cognito = new CognitoIdentityProviderClient({
    region: process.env.COGNITO_REGION,
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
}
