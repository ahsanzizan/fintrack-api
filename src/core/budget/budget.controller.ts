import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { budgets } from '@prisma/client';
import { ResponseTemplate } from 'src/utils/interceptors/transform.interceptor';

import { UseAuth } from '../auth/auth.decorator';
import { UserPayload } from '../auth/types';
import { BudgetService } from './budget.service';
import CreateBudgetDto from './dto/createBudget.dto';

@Controller({ path: 'budgets', version: '1' })
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Budget creation endpoint',
    tags: ['budget'],
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
}
