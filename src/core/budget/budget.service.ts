import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from 'src/lib/prisma';

import { CreateBudgetDto, UpdateBudgetDto } from './dto';
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

  async getBudget(
    budgetId: string,
    userId: string,
    include?: Prisma.budgetsInclude,
  ) {
    type budgetWithTransactions = Prisma.budgetsGetPayload<{
      include: {
        transactions: { select: { amount: true; transaction_type: true } };
      };
    }>;

    const budget = await this.prismaService.budgets.findUnique({
      where: { id: budgetId, user_id: userId },
      include,
    });

    if (!budget)
      throw new NotFoundException(
        `Budget with ID ${budgetId} that's created by user with ID ${userId} not found`,
      );

    return budget as budgetWithTransactions;
  }

  async getBudgetWithCurrentAmount(userId: string, budgetId: string) {
    const budget = await this.getBudget(budgetId, userId, {
      transactions: { select: { amount: true, transaction_type: true } },
    });

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

  async updateBudget(
    userId: string,
    budgetId: string,
    budgetData: UpdateBudgetDto,
  ) {
    // Validate the existence of the budget we're getting
    const budget = await this.getBudget(budgetId, userId);

    const updatedBudget = await this.prismaService.budgets.update({
      where: { id: budget.id },
      data: budgetData,
    });

    return updatedBudget;
  }

  async deleteBudget(userId: string, budgetId: string) {
    // Validate the existence of the budget we're getting
    const budget = await this.getBudget(budgetId, userId);

    const deletedBudget = await this.prismaService.budgets.delete({
      where: { id: budget.id },
    });

    return deletedBudget;
  }
}
