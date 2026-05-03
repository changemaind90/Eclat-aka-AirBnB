import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: String(process.env.GOOGLE_CLIENT_ID),
      clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
      callbackURL: 'http://localhost:3000/booking/api/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    _refreshToken: string,
    profile: unknown,
    done: VerifyCallback,
  ) {
    const p = profile as {
      name?: { givenName?: string; familyName?: string };
      emails?: Array<{ value: string }>;
      photos?: Array<{ value: string }>;
    };
    const email = p.emails?.[0]?.value;
    if (!email) return done(new Error('Google profile missing email'));
    const user = {
      email,
      firstName: p.name?.givenName,
      lastName: p.name?.familyName,
      picture: p.photos?.[0]?.value,
      accessToken,
    };
    done(null, user);
  }
}
