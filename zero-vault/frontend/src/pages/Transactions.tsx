import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Plus,
  Wallet,
} from "lucide-react";

import { PageFooter } from "../components/PageFooter";
import { StatCard } from "../components/StatCard";
import {
  TransactionsPanel,
  type TransactionFilter,
} from "../components/TransactionsPanel";

import type { DashboardSummary, Transaction } from "../types/transaction";
import { numberValue } from "../utils/formatters";

interface TransactionsProps {
  summary: DashboardSummary | null;
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  filter: TransactionFilter;
  onFilterChange: (value: TransactionFilter) => void;
  onRefresh: () => void;
  onAddTransaction: () => void;
}

interface MonthlyTransactionCount {
  month: string;
  label: string;
  count: number;
}

function getMonthKey(dateString: string): string | null {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatCount(count: number): string {
  return new Intl.NumberFormat("en-US").format(count);
}

export function Transactions({
  transactions,
  filteredTransactions,
  loading,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onRefresh,
  onAddTransaction,
}: TransactionsProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const currentMonth = (() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  })();

  // Build a list of months with transactions, including the current month.
  const monthlyTransactionCounts = useMemo<MonthlyTransactionCount[]>(() => {
    const counts = new Map<string, number>();

    for (const transaction of transactions) {
      const month = getMonthKey(transaction.transaction_date);

      if (month) {
        counts.set(month, (counts.get(month) ?? 0) + 1);
      }
    }

    if (!counts.has(currentMonth)) {
      counts.set(currentMonth, 0);
    }

    return Array.from(counts.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, count]) => ({
        month,
        label: formatMonth(month),
        count,
      }));
  }, [transactions, currentMonth]);

  const availableMonths = useMemo(
    () => monthlyTransactionCounts.map((item) => item.month),
    [monthlyTransactionCounts],
  );

  const activeMonth = availableMonths.includes(selectedMonth)
    ? selectedMonth
    : currentMonth;

  const selectedMonthIndex = availableMonths.indexOf(activeMonth);

  // Show transactions for the selected month while preserving search and filters.
  const monthlyTransactions = useMemo(() => {
    return filteredTransactions.filter(
      (transaction) =>
        getMonthKey(transaction.transaction_date) === activeMonth,
    );
  }, [filteredTransactions, activeMonth]);

  // Calculate financial totals for the selected month.
  const monthlySummary = useMemo(() => {
    const monthTransactions = transactions.filter(
      (transaction) =>
        getMonthKey(transaction.transaction_date) === activeMonth,
    );

    return monthTransactions.reduce(
      (totals, transaction) => {
        const amount = numberValue(transaction.amount);

        if (transaction.transaction_type === "income") {
          totals.income += amount;
        } else if (transaction.transaction_type === "expense") {
          totals.expenses += amount;
        }

        return totals;
      },
      { income: 0, expenses: 0 },
    );
  }, [transactions, activeMonth]);

  const monthlyBalance = monthlySummary.income - monthlySummary.expenses;

  // Count incoming, outgoing, and all transactions for the selected month.
  const monthlyTransactionSummary = useMemo(() => {
    const monthTransactions = transactions.filter(
      (transaction) =>
        getMonthKey(transaction.transaction_date) === activeMonth,
    );

    const incoming = monthTransactions.filter(
      (transaction) => transaction.transaction_type === "income",
    ).length;

    const outgoing = monthTransactions.filter(
      (transaction) => transaction.transaction_type === "expense",
    ).length;

    return {
      incoming,
      outgoing,
      total: monthTransactions.length,
    };
  }, [transactions, activeMonth]);

  function goToPreviousMonth() {
    // Months are sorted newest to oldest.
    const previousMonth = availableMonths[selectedMonthIndex + 1];

    if (previousMonth) {
      setSelectedMonth(previousMonth);
    }
  }

  function goToNextMonth() {
    const nextMonth = availableMonths[selectedMonthIndex - 1];

    if (nextMonth) {
      setSelectedMonth(nextMonth);
    }
  }

  function selectMonth(month: string) {
    setSelectedMonth(month);
  }

  return (
    <>
      {/* Page heading */}
      <section className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            PERSONAL FINANCE
          </div>

          <h1>Transactions.</h1>

          <p className="page-subtitle">
            View your transactions and financial activity month by month.
          </p>
        </div>

        <div className="heading-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Activity size={17} />
            )}

            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="button button-primary"
            onClick={onAddTransaction}
          >
            <Plus size={18} strokeWidth={2.2} />
            <span>Add transaction</span>
          </button>
        </div>
      </section>

      {/* Month selector */}
      <section className="panel transactions-month-selector">
        <div className="panel-header">
          <div>
            <h2>Select a month</h2>
            <p>Choose a month to view its transactions and financial totals.</p>
          </div>

          <CalendarRange size={20} />
        </div>

        <div className="month-selector-controls">
          <button
            type="button"
            className="button button-secondary month-nav-button"
            onClick={goToPreviousMonth}
            disabled={
              selectedMonthIndex < 0 ||
              selectedMonthIndex >= availableMonths.length - 1
            }
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>

          <label className="month-select-label">
            <span className="sr-only">Select month</span>

            <select
              className="month-select"
              value={activeMonth}
              onChange={(event) => selectMonth(event.target.value)}
            >
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="button button-secondary month-nav-button"
            onClick={goToNextMonth}
            disabled={selectedMonthIndex <= 0}
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={() => setSelectedMonth(currentMonth)}
            disabled={activeMonth === currentMonth}
          >
            This month
          </button>
        </div>
      </section>

      {/* Financial summary cards */}
      <section className="monthly-summary-section">
        <div className="summary-section-heading">
          <div>
            <h2>Financial overview</h2>
            <p>{formatMonth(activeMonth)}</p>
          </div>
        </div>

        <div className="stats-grid transactions-financial-grid">
          {loading && transactions.length === 0 ? (
            <>
              <div className="stat-skeleton" />
              <div className="stat-skeleton" />
              <div className="stat-skeleton" />
              <div className="stat-skeleton" />
            </>
          ) : (
            <>
              <StatCard
                title="Total Income"
                amount={monthlySummary.income}
                description="Money received this month"
                icon={ArrowDownLeft}
                variant="income"
                format="currency"
              />

              <StatCard
                title="Total Expenses"
                amount={monthlySummary.expenses}
                description="Money spent this month"
                icon={ArrowUpRight}
                variant="expense"
                format="currency"
              />

              <StatCard
                title="Net Balance"
                amount={monthlyBalance}
                description="Income minus expenses"
                icon={Wallet}
                variant="balance"
                format="currency"
              />

              <StatCard
                title="Total Spent"
                amount={monthlySummary.expenses}
                description="Total monthly expenses"
                icon={BarChart3}
                variant="expense"
                format="currency"
              />
            </>
          )}
        </div>
      </section>

      {/* Transaction count cards */}
      <section className="monthly-summary-section">
        <div className="summary-section-heading">
          <div>
            <h2>Transaction activity</h2>
            <p>Number of recorded transactions in {formatMonth(activeMonth)}</p>
          </div>

          <Activity size={20} />
        </div>

        <div className="transaction-count-grid">
          <article className="transaction-count-card incoming-count-card">
            <div className="transaction-count-card-top">
              <span className="transaction-count-icon">
                <ArrowDownLeft size={19} />
              </span>

              <span className="transaction-count-category">INCOMING</span>
            </div>

            <strong className="transaction-count-value">
              {formatCount(monthlyTransactionSummary.incoming)}
            </strong>

            <span className="transaction-count-description">
              {monthlyTransactionSummary.incoming === 1
                ? "income transaction"
                : "income transactions"}
            </span>
          </article>

          <article className="transaction-count-card outgoing-count-card">
            <div className="transaction-count-card-top">
              <span className="transaction-count-icon">
                <ArrowUpRight size={19} />
              </span>

              <span className="transaction-count-category">OUTGOING</span>
            </div>

            <strong className="transaction-count-value">
              {formatCount(monthlyTransactionSummary.outgoing)}
            </strong>

            <span className="transaction-count-description">
              {monthlyTransactionSummary.outgoing === 1
                ? "expense transaction"
                : "expense transactions"}
            </span>
          </article>

          <article className="transaction-count-card total-count-card">
            <div className="transaction-count-card-top">
              <span className="transaction-count-icon">
                <Activity size={19} />
              </span>

              <span className="transaction-count-category">TOTAL</span>
            </div>

            <strong className="transaction-count-value">
              {formatCount(monthlyTransactionSummary.total)}
            </strong>

            <span className="transaction-count-description">
              {monthlyTransactionSummary.total === 1
                ? "transaction recorded"
                : "transactions recorded"}
            </span>
          </article>
        </div>
      </section>

      {/* Transaction history */}
      <TransactionsPanel
        mode="all"
        transactions={monthlyTransactions}
        totalCount={monthlyTransactions.length}
        loading={loading}
        search={search}
        onSearchChange={onSearchChange}
        filter={filter}
        onFilterChange={onFilterChange}
      />

      {/* Monthly transaction counts */}
      <section className="panel monthly-transaction-counts">
        <div className="panel-header">
          <div>
            <h2>Transactions per month</h2>
            <p>
              Select a month to update the financial overview and transaction
              history.
            </p>
          </div>

          <BarChart3 size={20} />
        </div>

        {monthlyTransactionCounts.length === 0 ? (
          <p>No transactions recorded yet.</p>
        ) : (
          <div className="monthly-count-grid">
            {monthlyTransactionCounts.map((item) => (
              <button
                type="button"
                className={`monthly-count-card ${
                  item.month === activeMonth ? "active" : ""
                }`}
                key={item.month}
                onClick={() => selectMonth(item.month)}
                aria-pressed={item.month === activeMonth}
              >
                <span className="monthly-count-label">{item.label}</span>

                <strong className="monthly-count-number">
                  {formatCount(item.count)}
                </strong>

                <span className="monthly-count-caption">
                  {item.count === 1 ? "transaction" : "transactions"}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <PageFooter label={`Transactions for ${formatMonth(activeMonth)}`} />
    </>
  );
}
