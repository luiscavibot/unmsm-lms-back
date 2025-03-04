import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces';
import { LocalAuthGuard } from '../guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
