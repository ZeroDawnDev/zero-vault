import { ArrowUpRight, LoaderCircle, Search, X } from "lucide-react";
import type { Transaction, TransactionType } from "../types/transaction";
import { getTransactionIcon } from "../utils/categories";
import { formatDate, formatYen } from "../utils/formatters";
import { EmptyState } from "./EmptyState";

export type TransactionFilter = "all" | TransactionType;

interface TransactionsPanelProps {
  /** "overview" shows the 6 latest; "all" shows everything. */
  mode: "overview" | "all";
  /** Already filtered by search + type. */
  transactions: Transaction[];
  /** Unfiltered count, used for the initial loading state. */
  totalCount: number;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  filter: TransactionFilter;
  onFilterChange: (value: TransactionFilter) => void;
  onViewAll?: () => void;
}

export function TransactionsPanel({
  mode,
  transactions,
  totalCount,
  loading,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onViewAll,
}: TransactionsPanelProps) {
  const isOverview = mode === "overview";
  const visible = isOverview ? transactions.slice(0, 6) : transactions;
  const isFiltering = Boolean(search) || filter !== "all";

  return (
    <section className="panel transactions-panel" id="transactions-section">
      <div className="panel-header transactions-header">
        <div>
          <h2>{isOverview ? "Recent transactions" : "All transactions"}</h2>
          <p>
            {isOverview
              ? "Your latest financial activity"
              : `${transactions.length} matching transactions`}
          </p>
        </div>

        <div className="transaction-tools">
          <label className="search-field">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search transactions"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
            {search && (
              <button
                className="search-clear"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>

          <select
            className="filter-select"
            value={filter}
            onChange={(event) =>
              onFilterChange(event.target.value as TransactionFilter)
            }
            aria-label="Filter transactions by type"
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </div>
      </div>

      <div className="table-scroll">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>TRANSACTION</th>
              <th>CATEGORY</th>
              <th>DATE</th>
              <th>PAYMENT METHOD</th>
              <th className="amount-heading">AMOUNT</th>
            </tr>
          </thead>

          <tbody>
            {visible.map((transaction) => {
              const Icon = getTransactionIcon(transaction);
              const isIncome = transaction.transaction_type === "income";

              return (
                <tr key={transaction.id}>
                  <td>
                    <div className="merchant-cell">
                      <div
                        className={`merchant-icon ${
                          isIncome ? "merchant-income" : ""
                        }`}
                      >
                        <Icon size={17} strokeWidth={1.8} />
                      </div>
                      <div className="merchant-info">
                        <span className="merchant-name">
                          {transaction.merchant}
                        </span>
                        <span className="merchant-id">
                          ID #{transaction.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="category-badge">
                      {transaction.category || "Uncategorized"}
                    </span>
                  </td>

                  <td className="date-cell">
                    {formatDate(transaction.transaction_date)}
                  </td>

                  <td className="payment-cell">
                    {transaction.payment_method || "—"}
                  </td>

                  <td
                    className={`amount-cell ${isIncome ? "amount-income" : ""}`}
                  >
                    <span>
                      {isIncome ? "+" : "−"}
                      {formatYen(transaction.amount)}
                    </span>
                    <small>{isIncome ? "Income" : "Expense"}</small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && transactions.length === 0 && (
          <EmptyState
            title={isFiltering ? "No matching transactions" : "Your story starts here"}
            description={
              isFiltering
                ? "Try a different search or transaction filter."
                : "Add your first transaction to start tracking your money."
            }
          />
        )}

        {loading && totalCount === 0 && (
          <div className="loading-state">
            <LoaderCircle size={21} className="spin" />
            <span>Loading transactions…</span>
          </div>
        )}
      </div>

      {isOverview && transactions.length > 6 && onViewAll && (
        <button className="view-all-button" onClick={onViewAll}>
          View all transactions
          <ArrowUpRight size={15} />
        </button>
      )}

      {!isOverview && transactions.length > 0 && (
        <div className="table-footer">
          Showing {transactions.length} transactions
          <span>Amounts shown in Japanese yen (JPY)</span>
        </div>
      )}
    </section>
  );
}
