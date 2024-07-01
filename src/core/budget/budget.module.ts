import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/lib/prisma/prisma.module';

import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';

@Module({
  imports: [PrismaModule],
  providers: [BudgetService],
  controllers: [BudgetController],
  exports: [BudgetService],
})
export class BudgetModule {}
