import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.passwordHash) return null;
    const ok = await argon2.verify(user.passwordHash, pass);
    return ok ? user : null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.generateRefreshToken(),
    };
  }

  async hashPassword(password: string) {
    return argon2.hash(password);
  }

  generateRefreshToken() {
    // in production generate cryptographically secure token and persist
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
