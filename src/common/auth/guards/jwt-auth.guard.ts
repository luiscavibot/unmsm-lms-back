import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyType } from '../enums';

@Injectable()
export class JwtAuthGuard extends AuthGuard(StrategyType.JWT) {}
