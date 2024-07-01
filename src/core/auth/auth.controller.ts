import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ResponseTemplate } from 'src/utils/interceptors/transform.interceptor';

import { IsPublic, UseAuth } from './auth.decorator';
import { AuthService } from './auth.service';
import ResetPasswordDto from './dto/resetPassword.dto';
import SignInDto from './dto/signIn.dto';
import SignUpDto from './dto/signUp.dto';
import UpdateProfileDto from './dto/updateProfile.dto';
import { CreatedUser, UpdateProfileResult, UserPayload } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description: 'Register a new user with name, email, and password.',
  })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'Registered successfully.' })
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

  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'User authentication',
    description: 'Authenticate a user using email and password.',
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'Signed in successfully.' })
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

  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Get('verify/:token')
  @ApiOperation({
    summary: 'Verify email',
    description: 'Verify user email using a verification token.',
  })
  @ApiParam({
    name: 'token',
    description: "The verification token sent to the user's email.",
    example: 'some-verification-token',
  })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  async verify(
    @Param('token') verificationToken: string,
  ): Promise<ResponseTemplate<null>> {
    await this.authService.verifyEmail(verificationToken);

    return {
      message: 'Email verified successfully',
      result: null,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Patch('profile')
  @ApiOperation({
    summary: "Update the logged-in user's profile",
    description:
      'Update the profile of the logged-in user. An email verification will be sent if the email is changed.',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateProfile(
    @UseAuth() user: UserPayload,
    @Body() data: UpdateProfileDto,
  ): Promise<ResponseTemplate<UpdateProfileResult>> {
    const updatedProfile = await this.authService.updateProfile(user.sub, data);

    return {
      message: `Updated the profile successfully, email verification sent to ${updatedProfile.email}`,
      result: updatedProfile,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('request-password-reset')
  @ApiOperation({
    summary: 'Request a password reset token',
    description:
      "Request a password reset token to be sent to the logged-in user's email.",
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully.',
  })
  async requestPasswordReset(
    @UseAuth() user: UserPayload,
  ): Promise<ResponseTemplate<null>> {
    await this.authService.requestPasswordReset(user.email);

    return {
      message: `Password reset email sent to ${user.email}`,
      result: null,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  @ApiOperation({
    summary: "Reset logged-in user's password",
    description:
      'Reset the password for the logged-in user using a reset token and new password.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  async resetPassword(
    @UseAuth() user: UserPayload,
    @Body() data: ResetPasswordDto,
  ): Promise<ResponseTemplate<null>> {
    await this.authService.resetPassword(
      user.sub,
      data.resetToken,
      data.newPassword,
    );

    return {
      message: `Password for ${user.email} has been reset`,
      result: null,
    };
  }
}
