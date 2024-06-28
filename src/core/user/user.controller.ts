import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ResponseTemplate } from 'src/utils/interceptors/transform.interceptor';

import { UseAuth } from '../auth/auth.decorator';
import { UserPayload } from '../auth/types';
import { Profile } from './types';
import { UserService } from './user.service';

@Controller({ path: 'profile', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: "Returns user's profile", tags: ['profile'] })
  async getProfile(
    @UseAuth() user: UserPayload,
  ): Promise<ResponseTemplate<Profile>> {
    const profile = (await this.userService.getUser(user.email, {
      name: true,
      email: true,
      verification_token: true,
      is_verified: true,
      created_at: true,
      updated_at: true,
    })) as Profile;
    return { message: 'Successfully retrieved profile', result: profile };
  }
}
