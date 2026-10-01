import { Body, Controller, Post } from '@nestjs/common';
import { DemoDto } from './common/dtos/demo.dto.js';

@Controller()
export class AppController {
  @Post('/demo/echo')
  async echo(@Body() dto: DemoDto) {
    return dto;
  }
}
