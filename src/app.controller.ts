import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { IsPublic } from './core/auth/auth.decorator';

@Controller()
export class AppController {
  @HttpCode(HttpStatus.OK)
  @Get()
  @IsPublic()
  async root() {
    return {
      message: 'Welcome to FinTrack API',
      version: '1.0',
    };
  }
}
