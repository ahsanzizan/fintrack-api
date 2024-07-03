import { Prisma, TransactionType } from '@prisma/client';

export interface MonthlyReport {
  month: string;
  total_income: number;
  total_expenses: number;
  net_savings: number;
  income_details: { amount: number; category: string }[];
  expense_details: { amount: number; category: string }[];
  trends: {
    previous_month_total_income: number;
    previous_month_total_expense: number;
    income_trend: string; // Example: '+4.17%'
    expense_trend: string; // Example: '-4.17%'
  };
}

export type LimitedAttrTransaction = Prisma.transactionsGetPayload<{
  select: {
    amount: true;
    category: { select: { name: true } };
    transaction_type: true;
    transaction_date: true;
  };
}>;

export interface TransformedTransaction {
  amount: number;
  category: string;
  type: TransactionType;
  date: Date;
}

export interface ReportData {
  thisMonth: {
    expenses: TransformedTransaction[];
    incomes: TransformedTransaction[];
  };
  prevMonth: {
    expenses: TransformedTransaction[];
    incomes: TransformedTransaction[];
  };
}

export interface ReportDataTotals {
  thisMonth: {
    expenses: number;
    incomes: number;
  };
  prevMonth: {
    expenses: number;
    incomes: number;
  };
}
