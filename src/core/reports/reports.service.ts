import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma';
import { MONTHS } from 'src/utils/constants';

import { UserPayload } from '../auth/types';
import {
  LimitedAttrTransaction,
  MonthlyReport,
  ReportData,
  ReportDataTotals,
  TransformedTransaction,
} from './types';

@Injectable()
export class ReportsService {
  constructor(private readonly prismaService: PrismaService) {}

  filterAndMapTransactions(
    transactions: LimitedAttrTransaction[],
    lte: Date,
    gte: Date,
  ) {
    return transactions
      .filter(
        (transaction) =>
          transaction.transaction_date.getTime() < gte.getTime() &&
          transaction.transaction_date.getTime() > lte.getTime(),
      )
      .map((transaction) => ({
        amount: transaction.amount,
        category: transaction.category.name,
        type: transaction.transaction_type,
        date: transaction.transaction_date,
      }));
  }

  filterByType(
    transactions: TransformedTransaction[],
    type: 'EXPENSE' | 'INCOME',
  ) {
    return transactions.filter((transaction) => transaction.type === type);
  }

  validateMonth(month: string) {
    if (!MONTHS.includes(month.toLowerCase()))
      throw new BadRequestException('Invalid month');
  }

  validateYear(year: number) {
    if (year > new Date().getFullYear() || year < 0)
      throw new BadRequestException('Invalid year');
  }

  calculateTotalAmount(transactions: TransformedTransaction[]) {
    return transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0,
    );
  }

  async filterTransactionsByDate(userId: string, lte: Date, gte: Date) {
    const transactions = await this.prismaService.transactions.findMany({
      where: {
        user_id: userId,
        transaction_date: { lte, gte },
      },
      select: {
        amount: true,
        category: { select: { name: true } },
        transaction_type: true,
        transaction_date: true,
      },
    });

    return transactions;
  }

  constructReport(data: {
    month: string;
    year: number;
    totals: ReportDataTotals;
    details: ReportData;
  }) {
    const { month, year, totals, details } = data;

    const expenseTrend =
      (totals.thisMonth.expenses - totals.prevMonth.expenses) * 100;
    const incomeTrend =
      (totals.thisMonth.incomes - totals.prevMonth.incomes) * 100;

    const report: MonthlyReport = {
      month: `${month} ${year}`,
      total_expenses: totals.thisMonth.expenses,
      total_income: totals.thisMonth.incomes,
      net_savings: totals.thisMonth.incomes - totals.thisMonth.expenses,
      expense_details: details.thisMonth.expenses,
      income_details: details.thisMonth.incomes,
      trends: {
        previous_month_total_expense: totals.prevMonth.expenses,
        previous_month_total_income: totals.prevMonth.incomes,
        expense_trend: `${expenseTrend}%`,
        income_trend: `${incomeTrend}%`,
      },
    };

    return report;
  }

  async getReportByDate(user: UserPayload, year: number, month: string) {
    this.validateMonth(month);
    this.validateYear(year);

    const desiredDate = new Date(`${month} ${year}`);

    const firstDayOfPrevMonth = new Date(
      desiredDate.getFullYear(),
      desiredDate.getMonth() - 1,
      2,
    );
    const lastDayOfMonth = new Date(
      desiredDate.getFullYear(),
      desiredDate.getMonth() + 1,
      1,
    );

    const transactions = await this.filterTransactionsByDate(
      user.sub,
      lastDayOfMonth,
      firstDayOfPrevMonth,
    );

    const firstDayOfMonth = new Date(
      desiredDate.getFullYear(),
      desiredDate.getMonth(),
      1,
    );
    const lastDayOfPrevMonth = new Date(
      desiredDate.getFullYear(),
      desiredDate.getMonth(),
      0,
    );

    const thisMonthTransactions = this.filterAndMapTransactions(
      transactions,
      firstDayOfMonth,
      lastDayOfMonth,
    );
    const prevMonthTransactions = this.filterAndMapTransactions(
      transactions,
      firstDayOfPrevMonth,
      lastDayOfPrevMonth,
    );

    const details: ReportData = {
      thisMonth: {
        expenses: this.filterByType(thisMonthTransactions, 'EXPENSE'),
        incomes: this.filterByType(thisMonthTransactions, 'INCOME'),
      },
      prevMonth: {
        expenses: this.filterByType(prevMonthTransactions, 'EXPENSE'),
        incomes: this.filterByType(prevMonthTransactions, 'INCOME'),
      },
    };

    const totals: ReportDataTotals = {
      thisMonth: {
        incomes: this.calculateTotalAmount(details.thisMonth.incomes),
        expenses: this.calculateTotalAmount(details.thisMonth.expenses),
      },
      prevMonth: {
        incomes: this.calculateTotalAmount(details.prevMonth.incomes),
        expenses: this.calculateTotalAmount(details.prevMonth.expenses),
      },
    };

    const report = this.constructReport({ month, year, totals, details });

    return report;
  }
}
