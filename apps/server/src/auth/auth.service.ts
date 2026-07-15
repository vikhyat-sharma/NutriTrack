import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email);
    // Timing-safe: always hash even if user exists to prevent timing attacks
    const passwordHash = await argon2.hash(dto.password);
    if (existing) throw new ConflictException('Email already registered');
    const user = await this.users.createUser({ email: dto.email, passwordHash });
    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    // Always run argon2.verify to prevent timing-based user enumeration
    const dummyHash = '$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy';
    const valid = user?.passwordHash
      ? await argon2.verify(user.passwordHash, dto.password)
      : await argon2.verify(dummyHash, dto.password).then(() => false).catch(() => false);
    if (!user || !valid) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user.id, user.email);
  }

  async googleLogin(googleId: string, email: string, name?: string) {
    let user = await this.users.findByEmail(email);
    if (!user) {
      user = await this.users.createUser({ email });
      if (name) {
        await this.prisma.profile.create({
          data: {
            userId: user.id,
            name,
            age: 0,
            gender: 'OTHER',
            heightCm: 0,
            weightKg: 0,
            activityLevel: 'SEDENTARY',
            fitnessGoal: 'MAINTAIN',
          },
        });
      }
    }
    await this.prisma.oAuthAccount.upsert({
      where: { provider_providerId: { provider: 'google', providerId: googleId } },
      create: { provider: 'google', providerId: googleId, userId: user.id },
      update: {},
    });
    return this.issueTokens(user.id, user.email);
  }

  async requestPasswordReset(email: string) {
    // Always return the same message to prevent email enumeration (OWASP A07)
    const user = await this.users.findByEmail(email);
    if (!user) {
      return { message: 'If that email is registered, you will receive a reset link.' };
    }

    // Generate a cryptographically secure one-time token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await argon2.hash(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed token — reuse SessionToken table with a purpose marker
    await this.prisma.sessionToken.create({
      data: { userId: user.id, refreshTokenHash: `reset:${tokenHash}`, expiresAt },
    });

    // In production: send rawToken via email only. Never return it in the response.
    this.logger.log(`Password reset requested for user ${user.id}`);
    // TODO: inject MailService and call mailService.sendPasswordReset(user.email, rawToken)

    return { message: 'If that email is registered, you will receive a reset link.' };
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    // Find all unexpired reset sessions and check each hash (constant-time)
    const sessions = await this.prisma.sessionToken.findMany({
      where: {
        expiresAt: { gt: new Date() },
        refreshTokenHash: { startsWith: 'reset:' },
      },
    });

    let matchedSession: { id: string; userId: string } | null = null;
    for (const session of sessions) {
      const hash = session.refreshTokenHash.replace('reset:', '');
      const matches = await argon2.verify(hash, token).catch(() => false);
      if (matches) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) throw new UnauthorizedException('Invalid or expired reset token');

    // Invalidate the token immediately (one-time use)
    await this.prisma.sessionToken.delete({ where: { id: matchedSession.id } });

    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({ where: { id: matchedSession.userId }, data: { passwordHash } });

    return { message: 'Password updated successfully' };
  }

  async refresh(rawRefreshToken: string) {
    // Find all unexpired sessions and verify the token hash
    const sessions = await this.prisma.sessionToken.findMany({
      where: {
        expiresAt: { gt: new Date() },
        refreshTokenHash: { not: { startsWith: 'reset:' } },
      },
      include: { user: true },
    });

    let matchedSession: (typeof sessions)[0] | null = null;
    for (const session of sessions) {
      const matches = await argon2.verify(session.refreshTokenHash, rawRefreshToken).catch(() => false);
      if (matches) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) throw new UnauthorizedException('Invalid or expired refresh token');

    // Rotate: delete old session, issue new tokens
    await this.prisma.sessionToken.delete({ where: { id: matchedSession.id } });
    return this.issueTokens(matchedSession.userId, matchedSession.user.email);
  }

  async logout(rawRefreshToken: string) {
    const sessions = await this.prisma.sessionToken.findMany({
      where: { expiresAt: { gt: new Date() }, refreshTokenHash: { not: { startsWith: 'reset:' } } },
    });
    for (const session of sessions) {
      const matches = await argon2.verify(session.refreshTokenHash, rawRefreshToken).catch(() => false);
      if (matches) {
        await this.prisma.sessionToken.delete({ where: { id: session.id } });
        return { message: 'Logged out' };
      }
    }
    return { message: 'Logged out' };
  }

  private async issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = await argon2.hash(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.sessionToken.create({ data: { userId, refreshTokenHash, expiresAt } });

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
