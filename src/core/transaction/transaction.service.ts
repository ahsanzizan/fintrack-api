import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/lib/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTransaction(transactionData: Prisma.transactionsCreateInput) {
    const createdTransaction = await this.prismaService.transactions.create({
      data: transactionData,
    });

    return createdTransaction;
  }
}
