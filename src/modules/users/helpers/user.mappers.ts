import { GroupType } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoGroup, CognitoUser } from '../interfaces/cognito.interface';
import { User } from '../entities/user.entity';

export const mapUserFromCognito = (u: CognitoUser, g: GroupType[] = []): User => {
  const user: User = {
    id: u.Username ?? '',
    name: u.Attributes?.find((a) => a.Name === 'name')?.Value ?? '',
    email: u.Attributes?.find((a) => a.Name === 'email')?.Value ?? '',
    imgUrl: u.Attributes?.find((a) => a.Name === 'picture')?.Value ?? '',
    resumeUrl: u.Attributes?.find((a) => a.Name === 'custom:resumeUrl')?.Value ?? '',
    enabled: u.Enabled ?? false,
    status: u.UserStatus ?? 'UNCONFIRMED',
  };

  if (g.length > 0) {
    user.roleName = g[0].GroupName as CognitoGroup;
  }

  return user;
};
