import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { GetCodeDto, LoginDto } from '@/common/dtos/user.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('code')
  async getCode(@Body() dto: GetCodeDto) {
    return await this.authService.getCode(dto.phone);
  }
  @Post('/testVerifyToken')
  async testVerifyToken(@Body('token') token: string) {
    return await this.authService.verifyToken(token);
  }
}
