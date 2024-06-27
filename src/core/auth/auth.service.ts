import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { compareData, hashData } from 'src/utils/encryption.utility';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './types';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(username: string, email: string, password: string) {
    const createdUser = await this.userService.createUser(
      email,
      username,
      password,
    );

    return createdUser;
  }

  async signIn(inputEmail: string, inputPassword: string) {
    const user = await this.userService.getUser(inputEmail);
    if (!user)
      throw new NotFoundException(`User with email ${inputEmail} not found`);

    const passwordCorrect = compareData(user.password_hash, inputPassword);
    if (!passwordCorrect)
      throw new UnauthorizedException('Password is incorrect');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      password_hash,
      id,
      email,
      username,
      created_at,
      updated_at,
      ...userInfo
    } = user;

    const payload: UserPayload = {
      sub: id,
      email,
      username,
      createdAt: created_at,
      updatedAt: updated_at,
    };
    const signedPayload = await this.jwtService.signAsync(payload);

    return {
      access_token: signedPayload,
      ...payload,
    };
  }
}
