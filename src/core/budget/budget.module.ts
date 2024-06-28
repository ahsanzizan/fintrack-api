import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/lib/prisma/prisma.module';

import { Budget } from './budget';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';

@Module({
  imports: [PrismaModule],
  providers: [Budget, BudgetService],
  controllers: [BudgetController],
  exports: [BudgetService],
})
export class BudgetModule {}
