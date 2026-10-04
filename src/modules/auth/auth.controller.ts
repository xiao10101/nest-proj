import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { GetCodeDto, LoginDto } from '@/common/dtos/user.dto.js';
import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
import { Public } from '@/common/decorators/public.decorator.js';
import { RateLimit } from '@/common/decorators/rate-limit.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('code')
  @Public()
  @RateLimit(5, 60)
  async getCode(@Body() dto: GetCodeDto) {
    return await this.authService.getCode(dto.phone);
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: { userId: number }) {
    return user;
  }
}
