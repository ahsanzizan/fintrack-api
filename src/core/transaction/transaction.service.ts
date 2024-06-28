import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/lib/prisma/prisma.service';

import CreateTransactionDto from './dto/createTransaction.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}

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
}
