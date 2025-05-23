import { AttributeType, UserStatusType } from '@aws-sdk/client-cognito-identity-provider';

export interface CognitoUser {
  Username?: string;
  Attributes?: AttributeType[];
  Enabled?: boolean;
  UserStatus?: UserStatusType;
}

export type CognitoGroup = 'TEACHER' | 'STUDENT' | 'ADMIN';
