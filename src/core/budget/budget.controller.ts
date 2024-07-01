import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { budgets } from '@prisma/client';
import { ResponseTemplate } from 'src/utils/interceptors/transform.interceptor';

import { UseAuth } from '../auth/auth.decorator';
import { UserPayload } from '../auth/types';
import { IdParamDto } from '../global.dtos';
import { BudgetService } from './budget.service';
import CreateBudgetDto from './dto/createBudget.dto';
import { BudgetWithCurrentAmount } from './types';

@Controller({ path: 'budgets', version: '1' })
@ApiTags('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a budget',
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
  })
  async getBudget(
    @UseAuth() user: UserPayload,
    @Param() params: IdParamDto,
  ): Promise<ResponseTemplate<BudgetWithCurrentAmount>> {
    const { id } = params;
    const budget = await this.budgetService.getBudget(user.sub, id);

    return {
      message: 'Successfully retrieved budgets',
      result: budget,
    };
  }
}
