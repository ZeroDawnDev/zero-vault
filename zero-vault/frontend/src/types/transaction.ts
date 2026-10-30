export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  merchant: string;
  amount: number | string;
  currency: string;
  transaction_type: TransactionType;
  category: string;
  transaction_date: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

export interface DashboardSummary {
  currency: string;
  total_income: number | string;
  total_expenses: number | string;
  balance: number | string;
  transaction_count: number;
}

export interface TransactionCreate {
  merchant: string;
  amount: number;
  currency: string;
  transaction_type: TransactionType;
  category: string;
  transaction_date: string;
  payment_method: string;
  notes?: string | null;
}