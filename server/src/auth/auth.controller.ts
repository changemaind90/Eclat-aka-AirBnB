import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { Response } from 'express';
import { ApiHeaders, ApiResponse } from '@nestjs/swagger';
import type { AuthUser } from './types';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/booking/api/auth',
    maxAge: REFRESH_COOKIE_MAX_AGE,
  };
}

function clearRefreshCookieOptions() {
  const { maxAge: _maxAge, ...options } = refreshCookieOptions();
  return options;
}

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiResponse({
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJzb21lQGdtYWlsLmNvbSIsImlhdCI6MTc0NjMxMDAxMiwiZXhwIjoxNzQ2MzEwOTEyfQ.u6rORAjy3q4wSaCNZ2ZiR5h8BNX1Z8DYOYd7yR_Tk6M',
    },
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(dto);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions());
    res.send({ accessToken: tokens.accessToken, user: tokens.user });
  }

  @ApiResponse({
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJzb21lQGdtYWlsLmNvbSIsImlhdCI6MTc0NjMxMDAxMiwiZXhwIjoxNzQ2MzEwOTEyfQ.u6rORAjy3q4wSaCNZ2ZiR5h8BNX1Z8DYOYd7yR_Tk6M',
    },
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions());
    res.send({ accessToken: tokens.accessToken, user: tokens.user });
  }

  @ApiHeaders([
    {
      name: 'Bearer',
      example:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJzb21lQGdtYWlsLmNvbSIsImlhdCI6MTc0NjMxMDAxMiwiZXhwIjoxNzQ2MzEwOTEyfQ.u6rORAjy3q4wSaCNZ2ZiR5h8BNX1Z8DYOYd7yR_Tk6M',
    },
  ])
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(
    @Request() req: { user: AuthUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie(REFRESH_COOKIE, clearRefreshCookieOptions());
    return this.authService.logout(req.user.id);
  }

  @ApiResponse({
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJzb21lQGdtYWlsLmNvbSIsImlhdCI6MTc0NjMxMDAxMiwiZXhwIjoxNzQ2MzEwOTEyfQ.u6rORAjy3q4wSaCNZ2ZiR5h8BNX1Z8DYOYd7yR_Tk6M',
    },
  })
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(
    @Request() req: { user: AuthUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user.refreshToken) {
      res.clearCookie(REFRESH_COOKIE, clearRefreshCookieOptions());
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshTokens(
      req.user.id,
      req.user.refreshToken,
    );
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions());
    res.send({ accessToken: tokens.accessToken });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // passport redirects to Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Request() req: { user: { email: string } },
    @Res() res: Response,
  ) {
    const tokens = await this.authService.oauthLogin(req.user.email);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions());
    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';
    res.redirect(
      `${clientUrl}/auth/callback?token=${encodeURIComponent(tokens.accessToken)}`,
    );
  }
}
