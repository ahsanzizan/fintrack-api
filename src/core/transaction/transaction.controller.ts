import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { transactions } from '@prisma/client';
import { ResponseTemplate } from 'src/utils/interceptors/transform.interceptor';
import { PaginatedResult } from 'src/utils/paginator.utility';

import { UseAuth } from '../auth/auth.decorator';
import { UserPayload } from '../auth/types';
import CreateTransactionDto from './dto/createTransaction.dto';
import UpdateTransactionDto from './dto/updateTransaction.dto';
import { TransactionService } from './transaction.service';
import { TransactionsWithCategoryAndBudget } from './types';

@Controller({ path: 'transactions', version: '1' })
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a transaction',
    tags: ['transaction'],
  })
  async createTransaction(
    @UseAuth() user: UserPayload,
    @Body() data: CreateTransactionDto,
  ): Promise<ResponseTemplate<transactions>> {
    const createdTransaction = await this.transactionService.createTransaction(
      user.sub,
      data,
    );

    return {
      message: 'Successfully created a transaction',
      result: createdTransaction,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get logged-in user's transactions",
    tags: ['transaction'],
  })
  async getTransactions(
    @UseAuth() user: UserPayload,
    @Query('page') page?: number,
    @Query('search') search?: string,
    @Query('order_by') orderBy?: string,
    @Query('order_type') orderType?: string,
  ): Promise<
    ResponseTemplate<PaginatedResult<TransactionsWithCategoryAndBudget>>
  > {
    const paginatedTransactions =
      await this.transactionService.getPaginatedTransactions(
        user.sub,
        page,
        search,
        orderBy,
        orderType,
      );

    return {
      message: `Successfully retrieved ${user.name}'s transactions`,
      result: paginatedTransactions,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Find a transaction by ID',
    tags: ['transaction'],
  })
  async getTransaction(
    @UseAuth() user: UserPayload,
    @Param('id') id: string,
  ): Promise<ResponseTemplate<transactions>> {
    const transaction = await this.transactionService.getTransaction(
      id,
      user.sub,
    );

    return {
      message: 'Successfully retrieved the transaction',
      result: transaction,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a transaction by ID',
    tags: ['transaction'],
  })
  async updateTransaction(
    @UseAuth() user: UserPayload,
    @Param('id') id: string,
    @Body() data: UpdateTransactionDto,
  ): Promise<ResponseTemplate<transactions>> {
    const updatedTransaction = await this.transactionService.updateTransaction(
      id,
      user.sub,
      data,
    );

    return {
      message: 'Successfully updated the transaction',
      result: updatedTransaction,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a transaction by ID',
    tags: ['transaction'],
  })
  async deleteTransaction(
    @UseAuth() user: UserPayload,
    @Param('id') id: string,
  ): Promise<ResponseTemplate<transactions>> {
    const deletedTransaction = await this.transactionService.deleteTransaction(
      id,
      user.sub,
    );

    return {
      message: 'Successfully deleted the transaction',
      result: deletedTransaction,
    };
  }
}
