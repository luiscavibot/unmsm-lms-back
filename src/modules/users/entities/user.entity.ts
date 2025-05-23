import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserStatusType } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoGroup } from '../interfaces/cognito.interface';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  roleId?: CognitoGroup;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password?: string;

  @Column({ nullable: true })
  imgUrl?: string;

  @Column({ nullable: true, type: 'text' })
  resumeUrl?: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: 'ACTIVE' })
  status: UserStatusType;
}
