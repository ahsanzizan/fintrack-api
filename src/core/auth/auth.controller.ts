import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ResponseTemplate } from 'src/utils/interceptors/transform.interceptor';

import { AllowAnon } from './auth.decorator';
import { AuthService } from './auth.service';
import SignInDto from './dto/signIn.dto';
import SignUpDto from './dto/signUp.dto';
import { CreatedUser, UserPayload } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AllowAnon()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ApiOperation({ summary: 'User registration', tags: ['auth'] })
  async signUp(
    @Body() credentials: SignUpDto,
  ): Promise<ResponseTemplate<CreatedUser>> {
    const createduser = await this.authService.registerUser(
      credentials.name,
      credentials.email,
      credentials.password,
    );

    return { message: 'Registered successfully', result: createduser };
  }

  @AllowAnon()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Sign in endpoint', tags: ['auth'] })
  async signIn(
    @Body() credentials: SignInDto,
  ): Promise<ResponseTemplate<UserPayload>> {
    const payload = await this.authService.signIn(
      credentials.email,
      credentials.password,
    );

    return {
      message: 'Signed in successfully',
      result: payload,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Patch('verify/:token')
  @ApiOperation({ summary: 'Email verification endpoint', tags: ['auth'] })
  async verify(
    @Param('token') verificationToken: string,
  ): Promise<ResponseTemplate<null>> {
    await this.authService.verifyEmail(verificationToken);

    return {
      message: 'Email verified successfully',
      result: null,
    };
  }
}
