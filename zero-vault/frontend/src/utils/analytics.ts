import type { Transaction } from "../types/transaction";
import { categoryColors } from "./categories";
import { numberValue } from "./formatters";

export interface MonthlyDatum {
  key: string;
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryDatum {
  name: string;
  value: number;
  color: string;
}

export interface MerchantDatum {
  merchant: string;
  amount: number;
}

export function buildMonthlyData(transactions: Transaction[]): MonthlyDatum[] {
  const now = new Date();

  const months: MonthlyDatum[] = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: date.toLocaleDateString("en-US", { month: "short" }),
      income: 0,
      expenses: 0,
    };
  });

  for (const transaction of transactions) {
    const date = new Date(transaction.transaction_date);

    if (Number.isNaN(date.getTime())) continue;

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = months.find((item) => item.key === key);

    if (!month) continue;

    const amount = numberValue(transaction.amount);

    if (transaction.transaction_type === "income") {
      month.income += amount;
    } else {
      month.expenses += amount;
    }
  }

  return months;
}

export function buildCategoryData(transactions: Transaction[]): CategoryDatum[] {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.transaction_type !== "expense") continue;

    const category = transaction.category?.trim() || "Uncategorized";

    totals.set(
      category,
      (totals.get(category) ?? 0) + numberValue(transaction.amount),
    );
  }

  return Array.from(totals, ([name, value], index) => ({
    name,
    value,
    color: categoryColors[index % categoryColors.length],
  })).sort((a, b) => b.value - a.value);
}

export function buildTopMerchants(transactions: Transaction[]): MerchantDatum[] {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.transaction_type !== "expense") continue;

    const merchant = transaction.merchant?.trim() || "Unknown merchant";

    totals.set(
      merchant,
      (totals.get(merchant) ?? 0) + numberValue(transaction.amount),
    );
  }

  return Array.from(totals, ([merchant, amount]) => ({ merchant, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

export function getCurrentMonthExpenses(transactions: Transaction[]): number {
  const now = new Date();

  return transactions.reduce((total, transaction) => {
    const date = new Date(transaction.transaction_date);

    const isCurrentMonth =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth();

    if (isCurrentMonth && transaction.transaction_type === "expense") {
      return total + numberValue(transaction.amount);
    }

    return total;
  }, 0);
}

export function getTotalSpent(categoryData: CategoryDatum[]): number {
  return categoryData.reduce((total, item) => total + item.value, 0);
}
