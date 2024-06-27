import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { hashData } from 'src/utils/encryption.utility';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(email: string, username: string, password: string) {
    const findWithEmail = await this.prismaService.users.findUnique({
      where: { email },
    });
    if (findWithEmail)
      throw new UnauthorizedException(
        `User with email ${email} already exists`,
      );

    const hashedPassword = await hashData(password);
    const createdUser = await this.prismaService.users.create({
      data: { email, username, password_hash: hashedPassword },
      select: { username: true, email: true, created_at: true },
    });

    return createdUser;
  }

  async getUser(userEmail: string, select?: Prisma.usersSelect) {
    const user = await this.prismaService.users.findUnique({
      where: { email: userEmail },
      select,
    });

    return user;
  }
}
