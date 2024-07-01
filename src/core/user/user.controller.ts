import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseTemplate } from 'src/utils/interceptors/transform.interceptor';

import { UseAuth } from '../auth/auth.decorator';
import { UserPayload } from '../auth/types';
import { Profile } from './types';
import { UserService } from './user.service';

@Controller({ path: 'profile', version: '1' })
@ApiTags('profile')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({
    summary: "Get logged-in user's profile",
    description:
      "Retrieve the logged-in user's essentials data for its profile",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successfully retrieved the user's profile",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getProfile(
    @UseAuth() user: UserPayload,
  ): Promise<ResponseTemplate<Profile>> {
    const profile = (await this.userService.getUserProfile(
      user.email,
    )) as Profile;

    return {
      message: `Successfully retrieved ${user.name}'s profile`,
      result: profile,
    };
  }
}
