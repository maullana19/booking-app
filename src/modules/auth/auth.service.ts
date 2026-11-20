import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Login Method
  async signIn(email: string, pass: string) {
    // Find user byEmail First
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    // Create isMatch var for compared
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    // Create Payload & Handle tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return { access_tokens: await this.jwtService.signAsync(payload) };
  }
}
