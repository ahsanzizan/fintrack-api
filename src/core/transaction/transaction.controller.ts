import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Prisma, transactions } from '@prisma/client';
import { ResponseTemplate } from 'src/utils/interceptors/transform.interceptor';

import { UseAuth } from '../auth/auth.decorator';
import { UserPayload } from '../auth/types';
import CreateTransactionDto from './dto/createTransaction.dto';
import { TransactionService } from './transaction.service';

@Controller({ path: 'transaction', version: '1' })
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Transaction creation endpoint',
    tags: ['transaction'],
  })
  async createTransaction(
    @UseAuth() user: UserPayload,
    @Body() data: CreateTransactionDto,
  ): Promise<ResponseTemplate<transactions>> {
    const {
      amount,
      description,
      transaction_type,
      transaction_date,
      categoryName,
      budgetId,
    } = data;

    const connectUserId = { connect: { id: user.sub } };
    const createInput: Prisma.transactionsCreateInput = {
      amount,
      description,
      transaction_type,
      transaction_date,
      user: connectUserId,
      category: {
        connectOrCreate: {
          create: {
            name: data.categoryName,
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

    const createdTransaction =
      await this.transactionService.createTransaction(createInput);

    return {
      message: 'Successfully created a transaction',
      result: createdTransaction,
    };
  }
}
