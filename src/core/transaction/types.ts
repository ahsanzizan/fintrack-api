import { Prisma } from '@prisma/client';

export type TransactionsWithCategoryAndBudget = Prisma.transactionsGetPayload<{
  include: {
    category: { select: { name: true } };
    budget: { select: { name: true } };
  };
}>;
