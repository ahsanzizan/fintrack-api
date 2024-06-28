import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/lib/prisma/prisma.service';

import CreateBudgetDto from './dto/createBudget.dto';

@Injectable()
export class BudgetService {
  constructor(private readonly prismaService: PrismaService) {}

  async createBudget(userId: string, budgetData: CreateBudgetDto) {
    const createInput: Prisma.budgetsCreateInput = {
      ...budgetData,
      user: {
        connect: {
          id: userId,
        },
      },
    };

    const createdBudget = await this.prismaService.budgets.create({
      data: createInput,
    });

    return createdBudget;
  }

  async getBudget(budgetId: string) {
    const budget = await this.prismaService.budgets.findUnique({
      where: { id: budgetId },
    });

    return budget;
  }
}
