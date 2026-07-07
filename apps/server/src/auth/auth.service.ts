import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.users.createUser({ email: dto.email, passwordHash });
    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user.id, user.email);
  }

  async googleLogin(googleId: string, email: string, name?: string) {
    let user = await this.users.findByEmail(email);
    if (!user) {
      user = await this.users.createUser({ email });
      if (name) {
        await this.prisma.profile.create({
          data: { userId: user.id, name, age: 0, gender: 'OTHER', heightCm: 0, weightKg: 0, activityLevel: 'SEDENTARY', fitnessGoal: 'MAINTAIN' },
        });
      }
    }
    const existing = await this.prisma.oAuthAccount.findFirst({ where: { provider: 'google', providerId: googleId } });
    if (!existing) {
      await this.prisma.oAuthAccount.create({ data: { provider: 'google', providerId: googleId, userId: user.id } });
    }
    return this.issueTokens(user.id, user.email);
  }

  async requestPasswordReset(email: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new NotFoundException('No account with that email');
    // In production: generate a signed token, store it, and email the user
    const resetToken = this.jwt.sign({ sub: user.id, purpose: 'reset' }, { expiresIn: '1h' });
    return { message: 'Password reset email sent', resetToken };
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    if (payload.purpose !== 'reset') throw new UnauthorizedException('Invalid token purpose');
    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({ where: { id: payload.sub }, data: { passwordHash } });
    return { message: 'Password updated successfully' };
  }

  async refreshTokens(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.issueTokens(user.id, user.email);
  }

  private issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET') ?? 'refresh-secret',
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }
}
