import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from 'src/lib/prisma/prisma.service';

import CreateBudgetDto from './dto/createBudget.dto';
import { BudgetWithCurrentAmount } from './types';

@Injectable()
export class BudgetService {
  constructor(private readonly prismaService: PrismaService) {}

  async createBudget(userId: string, budgetData: CreateBudgetDto) {
    const createInput: Prisma.budgetsCreateInput = {
      ...budgetData,
      user: {
        connect: {
          id: userId,
        },
      },
    };

    const createdBudget = await this.prismaService.budgets.create({
      data: createInput,
    });

    return createdBudget;
  }

  async getBudget(userId: string, budgetId: string) {
    const budget = await this.prismaService.budgets.findUnique({
      where: { id: budgetId, user_id: userId },
      include: {
        transactions: {
          select: { amount: true, transaction_type: true },
        },
      },
    });

    if (!budget)
      throw new NotFoundException(
        `Budget with ID ${budgetId} that's created by user with ID ${userId} not found`,
      );

    const expenses = this.calculateTransactionsSum(
      budget.transactions,
      'EXPENSE',
    );
    const incomes = this.calculateTransactionsSum(
      budget.transactions,
      'INCOME',
    );
    const currentAmount = budget.amount + incomes - expenses;

    const BudgetWithCurrentAmount: BudgetWithCurrentAmount = {
      ...budget,
      current_amount: currentAmount,
    };

    return BudgetWithCurrentAmount;
  }

  calculateTransactionsSum(
    transactions: { amount: number; transaction_type: TransactionType }[],
    category: TransactionType,
  ) {
    const transactionsByCategory = transactions.filter(
      (transaction) => transaction.transaction_type === category,
    );
    const transactionsSum = transactionsByCategory.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    );

    return transactionsSum;
  }

  async getBudgets(userId: string) {
    const budgets = await this.prismaService.budgets.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        transactions: {
          select: { amount: true, transaction_type: true },
        },
      },
    });

    const budgetsWithCurrentAmount: BudgetWithCurrentAmount[] = budgets.map(
      (budget) => {
        const expenses = this.calculateTransactionsSum(
          budget.transactions,
          'EXPENSE',
        );
        const incomes = this.calculateTransactionsSum(
          budget.transactions,
          'INCOME',
        );
        const currentAmount = budget.amount + expenses - incomes;

        return {
          ...budget,
          current_amount: currentAmount,
        };
      },
    );

    return budgetsWithCurrentAmount;
  }
}
