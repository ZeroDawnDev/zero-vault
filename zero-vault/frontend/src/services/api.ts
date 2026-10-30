import type {
  DashboardSummary,
  Transaction,
  TransactionCreate,
} from "../types/transaction";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API request failed (${response.status}): ${message}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getTransactions(): Promise<Transaction[]> {
    return request<Transaction[]>("/transactions?limit=200");
  },

  getSummary(currency = "JPY"): Promise<DashboardSummary> {
    return request<DashboardSummary>(
      `/dashboard/summary?currency=${encodeURIComponent(currency)}`,
    );
  },

  createTransaction(
    transaction: TransactionCreate,
  ): Promise<Transaction> {
    return request<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
  },

  deleteTransaction(id: number): Promise<void> {
    return request<void>(`/transactions/${id}`, {
      method: "DELETE",
    });
  },
};