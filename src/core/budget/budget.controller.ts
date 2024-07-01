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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { budgets } from '@prisma/client';
import { ResponseTemplate } from 'src/utils/interceptors/transform.interceptor';

import { UseAuth } from '../auth/auth.decorator';
import { UserPayload } from '../auth/types';
import { IdParamDto } from '../global.dtos';
import { BudgetService } from './budget.service';
import CreateBudgetDto from './dto/createBudget.dto';
import UpdateBudgetDto from './dto/updateBudget.dto';
import { BudgetWithCurrentAmount } from './types';

@Controller({ path: 'budgets', version: '1' })
@ApiTags('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a budget',
    description:
      'Create a new budget for the logged-in user. The request body should include all the necessary details to create the budget.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully created a budget',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createBudget(
    @UseAuth() user: UserPayload,
    @Body() data: CreateBudgetDto,
  ): Promise<ResponseTemplate<budgets>> {
    const createdBudget = await this.budgetService.createBudget(user.sub, data);

    return {
      message: 'Successfully created a budget',
      result: createdBudget,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Retrieve all of the logged-in user's budgets",
    description:
      'Get all budgets that belong to the logged-in user. This endpoint returns a list of budgets along with their current amounts.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved budgets',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getBudgets(
    @UseAuth() user: UserPayload,
  ): Promise<ResponseTemplate<BudgetWithCurrentAmount[]>> {
    const budgets = await this.budgetService.getBudgets(user.sub);

    return {
      message: 'Successfully retrieved budgets',
      result: budgets,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Retrieve a logged-in user's budget by ID",
    description:
      'Get a specific budget by its ID. This endpoint retrieves a budget along with its current amount for the logged-in user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved budget',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Budget not found',
  })
  async getBudget(
    @UseAuth() user: UserPayload,
    @Param() params: IdParamDto,
  ): Promise<ResponseTemplate<BudgetWithCurrentAmount>> {
    const { id } = params;
    const budget = await this.budgetService.getBudgetWithCurrentAmount(
      user.sub,
      id,
    );

    return {
      message: 'Successfully retrieved budget',
      result: budget,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update budget by ID',
    description:
      'Update the details of an existing budget by its ID. The request body should include the updated details of the budget.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully updated the budget',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Budget not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async updateBudget(
    @UseAuth() user: UserPayload,
    @Param() params: IdParamDto,
    @Body() data: UpdateBudgetDto,
  ): Promise<ResponseTemplate<budgets>> {
    const { id } = params;
    const updatedBudget = await this.budgetService.updateBudget(
      user.sub,
      id,
      data,
    );

    return {
      message: 'Successfully updated the budget',
      result: updatedBudget,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete budget by ID',
    description:
      "Delete an existing budget by its ID. This endpoint removes the budget from the logged-in user's account.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully deleted the budget',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Budget not found',
  })
  async deleteBudget(
    @UseAuth() user: UserPayload,
    @Param() params: IdParamDto,
  ): Promise<ResponseTemplate<budgets>> {
    const { id } = params;
    const deletedBudget = await this.budgetService.deleteBudget(user.sub, id);

    return {
      message: 'Successfully deleted the budget',
      result: deletedBudget,
    };
  }
}
