import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StrategyType } from '../enums';
import * as jwksRsa from 'jwks-rsa';

interface CognitoJwtPayload {
  sub: string;
  iss: string;
  token_use: 'id' | 'access';
  scope?: string;
  'cognito:groups'?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, StrategyType.JWT) {
  constructor(private readonly configService: ConfigService) {
    const region = configService.get<string>('COGNITO_REGION');
    const userPoolId = configService.get<string>('COGNITO_USER_POOL_ID');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        cacheMaxEntries: 5,
        cacheMaxAge: 10 * 60 * 60 * 1000,
        jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
      }),
      algorithms: ['RS256'],
      issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
    });
  }

  async validate(payload: CognitoJwtPayload) {
    if (!payload.sub) throw new UnauthorizedException('Invalid token');
    console.log('payload', payload);
    return {
      userId: payload.sub,
      rolName: payload['cognito:groups']?.[0] ?? null,
    };
  }
}
