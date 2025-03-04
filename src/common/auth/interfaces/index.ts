import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    roleId: string | null;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
  };
}
