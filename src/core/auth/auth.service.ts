import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareData } from 'src/utils/encryption.utility';
import { UserService } from '../user/user.service';
import { UserPayload } from './types';
import * as nodemailer from 'nodemailer';
import { config } from 'src/config';
import { MailOptions } from 'nodemailer/lib/smtp-transport';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

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
    const user = await this.userService.getUser(inputEmail);
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
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: config.serviceEmail,
        pass: config.servicePassword,
      },
    });

    const mailOptions: MailOptions = {
      from: config.serviceEmail,
      to: email,
      subject: 'Verify your email for FinTrack!',
      text: `Please verify your email by clicking on the following link: ${config.baseUrl}/auth/verify/${verificationToken}`,
    };

    await transporter.sendMail(mailOptions);
  }

  async verifyEmail(verificationToken: string) {
    const payload = await this.jwtService.verifyAsync<{ email: string }>(
      verificationToken,
    );
    const user = await this.userService.getUser(payload.email);

    if (!user) throw new UnauthorizedException('Verification token is invalid');

    await this.userService.updateUser(user.id, {
      is_verified: true,
      verification_token: '',
    });
  }
}
