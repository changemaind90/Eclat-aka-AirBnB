import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { AuthUser, JwtPayload } from '../types';

type RequestWithCookies = Omit<Request, 'cookies'> & {
  cookies?: Record<string, string>;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (req: RequestWithCookies | undefined): string | null =>
        req?.cookies?.refreshToken ?? null,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: RequestWithCookies, payload: JwtPayload): AuthUser {
    return {
      id: payload.id,
      email: payload.email,
      refreshToken: req.cookies?.refreshToken,
    };
  }
}
