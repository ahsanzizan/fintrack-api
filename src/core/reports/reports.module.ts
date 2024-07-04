import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/lib/prisma';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [PrismaModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
