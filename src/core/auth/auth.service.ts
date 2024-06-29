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
import { compareData } from 'src/utils/encryption.utility';

import { UserService } from '../user/user.service';
import UpdateProfileDto from './dto/updateProfile.dto';
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
    const verificationToken = await this.jwtService.signAsync({ email });
    const createdUser = await this.userService.createUser(
      email,
      name,
      password,
      verificationToken,
    );

    try {
      await this.sendVerificationEmail(email, verificationToken);
    } catch (error) {
      throw new InternalServerErrorException('Cannot send verification email');
    }

    return createdUser;
  }

  async signIn(inputEmail: string, inputPassword: string) {
    const user = await this.userService.getUser({ email: inputEmail });
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
      createdAt: created_at,
      updatedAt: updated_at,
    };
    const signedPayload = await this.jwtService.signAsync(payload);

    return {
      access_token: signedPayload,
      ...payload,
    };
  }

  async sendVerificationEmail(email: string, verificationToken: string) {
    const mailOptions: MailOptions = {
      from: config.serviceEmail,
      to: email,
      subject: 'Verify your email for FinTrack!',
      text: `Please verify your email by clicking on the following link: ${config.baseUrl}/auth/verify/${verificationToken}`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async verifyEmail(verificationToken: string) {
    const payload = await this.jwtService.verifyAsync<{ email: string }>(
      verificationToken,
    );
    const user = await this.userService.getUser({ email: payload.email });

    if (!user) throw new UnauthorizedException('Verification token is invalid');

    await this.userService.updateUser(user.id, {
      is_verified: true,
      verification_token: '',
    });
  }

  async updateProfile(userId: string, profileData: UpdateProfileDto) {
    const user = await this.userService.getUser({ id: userId });

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const { email, name } = profileData;
    const updateInput: Prisma.usersUpdateInput = {
      email,
      name,
      is_verified: undefined,
      verification_token: undefined,
    };

    if (email && email != user.email) {
      const findWithEmail = await this.userService.getUser({ email });
      if (findWithEmail) throw new ForbiddenException('Email already in use');

      const newVerificationToken = await this.jwtService.signAsync({ email });

      updateInput.is_verified = false;
      updateInput.verification_token = newVerificationToken;

      await this.sendVerificationEmail(email, newVerificationToken);
    }

    const updatedUser = await this.userService.updateUser(user.id, updateInput);

    return updatedUser;
  }
}
