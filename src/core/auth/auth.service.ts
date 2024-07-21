import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/smtp-transport';
import { config } from 'src/config';
import { compareData, hashData } from 'src/utils/encryption.utility';
import { v4 as uuidv4 } from 'uuid';

import { UserService } from '../user/user.service';
import { UpdateProfileDto } from './dto';
import { UserPayload } from './types';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: config.serviceEmail,
        pass: config.servicePassword,
      },
    });
  }

  async registerUser(name: string, email: string, password: string) {
    const user = await this.userService.getUserStrict({ email });
    if (user)
      throw new ForbiddenException(`User with email ${email} already exists`);

    const verificationToken = await this.jwtService.signAsync({ email });
    const createdUser = await this.userService.createUser(
      email,
      name,
      password,
      verificationToken,
    );

    await this.sendEmail({
      email,
      subject: 'Verify your email for FinTrack',
      text: `Please verify your email by clicking on the following link: ${config.baseUrl}/auth/verify/${verificationToken}`,
      errorMessage: 'Failed to send verification email',
    });

    return createdUser;
  }

  async signIn(inputEmail: string, inputPassword: string) {
    const user = await this.userService.getUserStrict({ email: inputEmail });
    if (!user)
      throw new NotFoundException(`User with email ${inputEmail} not found`);

    const passwordCorrect = compareData(user.password_hash, inputPassword);
    if (!passwordCorrect)
      throw new UnauthorizedException('Password is incorrect');

    const { id, email, name, created_at, updated_at } = user;

    const payload: UserPayload = {
      sub: id,
      email,
      name,
      createdAt: created_at.toISOString(),
      updatedAt: updated_at.toISOString(),
    };
    const signedPayload = await this.jwtService.signAsync(payload);

    return {
      access_token: signedPayload,
      ...payload,
    };
  }

  async sendEmail(content: {
    email: string;
    subject: string;
    text: string;
    errorMessage: string;
  }) {
    const mailOptions: MailOptions = {
      from: config.serviceEmail,
      to: content.email,
      subject: content.subject,
      text: content.text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      // errorMessage will be used for throwing exception when the email sending failed mid-process
      throw new InternalServerErrorException(content.errorMessage);
    }
  }

  async verifyEmail(verificationToken: string) {
    let payload: { email: string };
    try {
      payload = await this.jwtService.verifyAsync<{ email: string }>(
        verificationToken,
      );
    } catch (error) {
      throw new UnauthorizedException('Verification token is invalid');
    }

    const user = await this.userService.getUserStrict({ email: payload.email });

    if (!user) throw new UnauthorizedException('Verification token is invalid');

    await this.userService.updateUser(user.id, {
      is_verified: true,
      verification_token: '',
    });
  }

  async updateProfile(userId: string, profileData: UpdateProfileDto) {
    const user = await this.userService.getUserStrict({ id: userId });

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const { email, name } = profileData;
    const updateInput: Prisma.usersUpdateInput = {
      email,
      name,
      is_verified: undefined,
      verification_token: undefined,
    };

    if (email && email != user.email) {
      const findWithEmail = await this.userService.getUserStrict({ email });
      if (findWithEmail) throw new ForbiddenException('Email already in use');

      const newVerificationToken = await this.jwtService.signAsync({ email });

      updateInput.is_verified = false;
      updateInput.verification_token = newVerificationToken;

      await this.sendEmail({
        email,
        subject: 'Verify your email for FinTrack',
        text: `Please verify your email by clicking on the following link: ${config.baseUrl}/auth/verify/${newVerificationToken}`,
        errorMessage: 'Failed to send verification email',
      });
    }

    const updatedUser = await this.userService.updateUser(user.id, updateInput);

    return updatedUser;
  }

  async requestPasswordReset(email: string) {
    const user = await this.userService.getUserStrict({ email });
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);

    const resetToken = uuidv4();
    const updateInput: Prisma.usersUpdateInput = {
      reset_token: resetToken,
      reset_token_expiry: new Date(Date.now() + config.resetTokenExpiryTime),
    };

    const updatedUser = await this.userService.updateUser(user.id, updateInput);

    await this.sendEmail({
      email,
      subject: 'Reset Your Password',
      text: `Please reset your password by clicking on the following link: ${config.baseUrl}/reset-password?token=${resetToken}\nThe link will be invalid in ${config.resetTokenExpiryTime / 60 / 1000} minutes time`,
      errorMessage: 'Failed to send reset password email',
    });

    return updatedUser;
  }

  async resetPassword(userId: string, token: string, newPassword: string) {
    const user = await this.userService.getUser({
      id: userId,
      reset_token: token,
      reset_token_expiry: { gte: new Date() },
    });

    if (!user) throw new ForbiddenException('Invalid or expired token');

    const updateInput: Prisma.usersUpdateInput = {
      password_hash: await hashData(newPassword),
      reset_token: null,
      reset_token_expiry: null,
    };

    const updatedUser = await this.userService.updateUser(userId, updateInput);

    return updatedUser;
  }
}
