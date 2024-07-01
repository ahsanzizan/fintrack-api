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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
    const budget = await this.budgetService.getBudgetWithCurrentAmount(
      user.sub,
      id,
    );

    return {
      message: 'Successfully retrieved budgets',
      result: budget,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update budget by ID',
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
  })
  async deleteBudget(
    @UseAuth() user: UserPayload,
    @Param() params: IdParamDto,
  ): Promise<ResponseTemplate<budgets>> {
    const { id } = params;
    const deletedBudget = await this.budgetService.deleteBudget(user.sub, id);

    return {
      message: 'Successfully updated the budget',
      result: deletedBudget,
    };
  }
}
