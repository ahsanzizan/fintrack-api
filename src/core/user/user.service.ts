import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { hashData } from 'src/utils/encryption.utility';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    email: string,
    name: string,
    password: string,
    verificationToken: string,
  ) {
    const findWithEmail = await this.prismaService.users.findUnique({
      where: { email },
    });
    if (findWithEmail)
      throw new UnauthorizedException(
        `User with email ${email} already exists`,
      );

    const hashedPassword = await hashData(password);
    const createdUser = await this.prismaService.users.create({
      data: {
        email,
        name,
        password_hash: hashedPassword,
        verification_token: verificationToken,
      },
      select: { name: true, email: true, created_at: true },
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

  async updateUser(id: string, data: Prisma.usersUpdateInput) {
    const updatedUser = await this.prismaService.users.update({
      where: { id },
      data,
    });

    return updatedUser;
  }
}
