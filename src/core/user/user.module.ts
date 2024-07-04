import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/lib/prisma';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
