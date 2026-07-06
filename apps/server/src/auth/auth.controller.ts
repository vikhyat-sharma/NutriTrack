import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto,
} from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** Accepts a Google ID token from the mobile/web client and returns JWT tokens. */
  @Post('google')
  async googleLogin(@Body() body: { idToken: string }) {
    // In production: verify idToken with Google's tokeninfo endpoint or google-auth-library
    // For now we decode the payload (base64) — replace with real verification in prod
    const parts = body.idToken.split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid Google ID token format' };
    }
    const decoded = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return this.authService.googleLogin(decoded.sub, decoded.email, decoded.name);
  }

  @Post('password-reset')
  requestReset(@Body() dto: PasswordResetRequestDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('password-reset/confirm')
  confirmReset(@Body() dto: PasswordResetConfirmDto) {
    return this.authService.confirmPasswordReset(dto.token, dto.newPassword);
  }
}
