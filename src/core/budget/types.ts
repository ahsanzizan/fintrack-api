import { budgets } from '@prisma/client';

export interface BudgetWithCurrentAmount extends budgets {
  current_amount: number;
}
