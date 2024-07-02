import { Module } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [PrismaService],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
