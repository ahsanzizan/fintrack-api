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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { transactions } from '@prisma/client';
import { ResponseTemplate } from 'src/utils/interceptors/transform.interceptor';
import { PaginatedResult } from 'src/utils/paginator.utility';

import { UseAuth } from '../auth/auth.decorator';
import { UserPayload } from '../auth/types';
import CreateTransactionDto from './dto/createTransaction.dto';
import UpdateTransactionDto from './dto/updateTransaction.dto';
import { TransactionService } from './transaction.service';
import { TransactionsWithCategoryAndBudget } from './types';

@ApiTags('transactions')
@Controller({ path: 'transactions', version: '1' })
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a transaction',
    description: 'Create a new transaction for the logged-in user.',
  })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a transaction.',
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
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'The page number for pagination. Starts at 1.',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description:
      "Search term inside the transactions' description and category.",
    type: String,
    example: 1,
  })
  @ApiQuery({
    name: 'order_by',
    required: false,
    description: `The sorting order of the transactions. Possible values are "amount" for sorting based on transaction's amount and "transaction_date" for sorting based on transaction's date.`,
    type: String,
    example: 'amount',
  })
  @ApiQuery({
    name: 'order_type',
    required: false,
    description:
      'The ordering type. "asc" for ascending and "desc" for descending',
    type: String,
    example: 'desc',
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
    description: 'Retrieve a specific transaction by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the transaction to retrieve.',
    type: String,
    example: '60c72b2f9b1e8e4c3d6f7b12',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the transaction.',
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
    description: 'Update the details of a specific transaction by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the transaction to update.',
    type: String,
    example: '60c72b2f9b1e8e4c3d6f7b12',
  })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the transaction.',
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
    description: 'Delete a specific transaction by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the transaction to delete.',
    type: String,
    example: '7dd32282-cc3b-4a32-a1ae-27a846d9ca10',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted the transaction.',
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
