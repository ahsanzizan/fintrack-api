import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { paginator } from 'src/utils/paginator.utility';

import CreateTransactionDto from './dto/createTransaction.dto';
import UpdateTransactionDto from './dto/updateTransaction.dto';
import { TransactionsWithCategoryAndBudget } from './types';

const paginate = paginator(10);

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}

  async validateBudgetId(budgetId: string, userId: string) {
    const budget = await this.prismaService.budgets.findUnique({
      where: { id: budgetId, user_id: userId },
    });

    if (!budget)
      throw new NotFoundException(
        `Budget with ID ${budgetId} that's created by user with ID ${userId} not found`,
      );

    if (budget?.end_date.getTime() <= new Date().getTime())
      throw new ForbiddenException(
        `The budget with ID ${budget.id} has already expired.`,
      );
  }

  async createTransaction(
    userId: string,
    transactionData: CreateTransactionDto,
  ) {
    const {
      amount,
      description,
      transaction_type,
      transaction_date,
      categoryName,
      budgetId,
    } = transactionData;

    await this.validateBudgetId(budgetId, userId);

    const connectUserId = { connect: { id: userId } };
    const createInput: Prisma.transactionsCreateInput = {
      amount,
      description,
      transaction_type,
      transaction_date,
      user: connectUserId,
      category: {
        connectOrCreate: {
          create: {
            name: categoryName,
            user: connectUserId,
          },
          where: { name: categoryName },
        },
      },
      budget: {
        connect: {
          id: budgetId,
        },
      },
    };

    const createdTransaction = await this.prismaService.transactions.create({
      data: createInput,
    });

    return createdTransaction;
  }

  async getTransaction(transactionId: string, userId: string) {
    const transaction = await this.prismaService.transactions.findUnique({
      where: { id: transactionId, user_id: userId },
      include: {
        budget: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        category: { select: { name: true } },
      },
    });

    if (!transaction)
      throw new NotFoundException(
        `Transaction with ID ${transactionId} that's created by user with ID ${userId} not found`,
      );

    return transaction;
  }

  async getTransactions(userId: string) {
    const transactions = await this.prismaService.transactions.findMany({
      where: { user_id: userId },
    });

    return transactions;
  }

  async getPaginatedTransactions(
    userId: string,
    page?: number,
    search?: string,
    orderBy?: string,
    orderType?: string,
  ) {
    const searchClause: Prisma.transactionsWhereInput = search
      ? {
          user_id: userId,
          OR: [
            {
              description: {
                contains: search,
                mode: 'insensitive',
              },
              category: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          ],
        }
      : {};

    const findManyInput: Prisma.transactionsFindManyArgs = {
      where: searchClause,
      orderBy: { amount: undefined, transaction_date: undefined },
      include: {
        category: { select: { name: true } },
        budget: { select: { name: true } },
      },
    };
    if (orderBy && ['amount', 'transaction_date'].includes(orderBy)) {
      const validOrderType =
        orderType && ['asc', 'desc'].includes(orderType) ? orderType : 'asc';

      findManyInput.orderBy![orderBy] = validOrderType;
    }

    const paginatedTransactions = await paginate<
      TransactionsWithCategoryAndBudget,
      Prisma.transactionsFindManyArgs
    >(this.prismaService.transactions, page, findManyInput);

    return paginatedTransactions;
  }

  async updateTransaction(
    transactionId: string,
    userId: string,
    transactionData: UpdateTransactionDto,
  ) {
    const transaction = await this.getTransaction(transactionId, userId);

    const {
      amount,
      description,
      transaction_type,
      transaction_date,
      categoryName,
      budgetId,
    } = transactionData;

    if (budgetId) await this.validateBudgetId(budgetId, transaction.user_id);

    const updateInput: Prisma.transactionsUpdateInput = {
      amount,
      description,
      transaction_type,
      transaction_date,
      category: categoryName
        ? {
            connectOrCreate: {
              create: {
                name: categoryName,
                user: { connect: { id: transaction.user_id } },
              },
              where: { name: categoryName },
            },
          }
        : undefined,
      budget: budgetId
        ? {
            connect: {
              id: budgetId,
            },
          }
        : undefined,
    };

    const updatedTransaction = await this.prismaService.transactions.update({
      where: { id: transaction.id },
      data: updateInput,
    });

    return updatedTransaction;
  }

  async deleteTransaction(transactionId: string, userId: string) {
    const transaction = await this.getTransaction(transactionId, userId);

    const deletedTransaction = await this.prismaService.transactions.delete({
      where: { id: transaction.id },
    });

    return deletedTransaction;
  }
}
