import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarRange,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  TrendingDown,
  Wallet,
  PiggyBank,
  Percent,
} from "lucide-react";

import { CashFlowChart } from "../charts/CashFlowChart";
import { ExpensePieChart } from "../charts/ExpensePieChart";
import { MerchantBarChart } from "../charts/MerchantBarChart";
import { EmptyState } from "../components/EmptyState";
import { PageFooter } from "../components/PageFooter";
import { StatCard } from "../components/StatCard";

import type { DashboardSummary, Transaction } from "../types/transaction";

import {
  buildCategoryData,
  buildMonthlyData,
  buildTopMerchants,
  getTotalSpent,
  type CategoryDatum,
  type MerchantDatum,
  type MonthlyDatum,
} from "../utils/analytics";

import { formatYen, numberValue } from "../utils/formatters";

interface AnalyticsProps {
  summary: DashboardSummary | null;
  transactions: Transaction[];
  monthlyData: MonthlyDatum[];
  categoryData: CategoryDatum[];
  merchantData: MerchantDatum[];
  loading: boolean;
  onRefresh: () => void;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getTransactionMonth(transaction: Transaction): string | null {
  const date = new Date(transaction.transaction_date);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return getMonthKey(date);
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function Analytics({
  transactions,
  loading,
  onRefresh,
}: AnalyticsProps) {
  const currentMonth = getMonthKey(new Date());

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Include the current month and every month that has transaction data.
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>([currentMonth]);

    for (const transaction of transactions) {
      const month = getTransactionMonth(transaction);

      if (month) {
        monthSet.add(month);
      }
    }

    return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  }, [transactions, currentMonth]);

  // If the selected month is no longer available, use the current month.
  const activeMonth = availableMonths.includes(selectedMonth)
    ? selectedMonth
    : currentMonth;

  const selectedTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) => getTransactionMonth(transaction) === activeMonth,
      ),
    [transactions, activeMonth],
  );

  const monthlyStats = useMemo(() => {
    return selectedTransactions.reduce(
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
  }, [selectedTransactions]);

  const savings = monthlyStats.income - monthlyStats.expenses;

  const savingsRate =
    monthlyStats.income > 0
      ? (savings / monthlyStats.income) * 100
      : 0;

  const categoryData = useMemo(
    () => buildCategoryData(selectedTransactions),
    [selectedTransactions],
  );

  const merchantData = useMemo(
    () => buildTopMerchants(selectedTransactions),
    [selectedTransactions],
  );

  const totalSpent = getTotalSpent(categoryData);

  const cashFlowData = useMemo(
    () => buildMonthlyData(transactions),
    [transactions],
  );

  const selectedMonthIndex = availableMonths.indexOf(activeMonth);

  function selectPreviousMonth() {
    // availableMonths is sorted newest first.
    const nextMonth = availableMonths[selectedMonthIndex + 1];

    if (nextMonth) {
      setSelectedMonth(nextMonth);
    }
  }

  function selectNextMonth() {
    const nextMonth = availableMonths[selectedMonthIndex - 1];

    if (nextMonth) {
      setSelectedMonth(nextMonth);
    }
  }

  return (
    <div className="analytics-page">
      <section className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            FINANCIAL INTELLIGENCE
          </div>

          <h1>Your financial analytics.</h1>

          <p className="page-subtitle">
            Understand your income, savings, spending patterns, and where your
            money goes.
          </p>
        </div>

        <button
          className="button button-secondary"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <Activity size={17} />
          )}
          Refresh data
        </button>
      </section>

      {/* Month selector */}
      <section className="panel analytics-month-selector">
        <div className="panel-header">
          <div>
            <h2>Monthly overview</h2>
            <p>Choose a month to review your financial performance.</p>
          </div>

          <CalendarRange size={20} />
        </div>

        <div className="month-selector-controls">
          <button
            type="button"
            className="button button-secondary month-nav-button"
            onClick={selectPreviousMonth}
            disabled={selectedMonthIndex === availableMonths.length - 1}
            aria-label="Previous available month"
          >
            <ChevronLeft size={18} />
          </button>

          <label className="month-select-label">
            <span className="sr-only">Select month</span>
            <select
              className="month-select"
              value={activeMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
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
            onClick={selectNextMonth}
            disabled={selectedMonthIndex <= 0}
            aria-label="Next available month"
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

      {/* Monthly financial summary */}
      <section className="stats-grid">
        <StatCard
          title="Monthly income"
          amount={monthlyStats.income }
          description={`Income recorded in ${formatMonth(activeMonth)}`}
          icon={ArrowDownLeft}
          variant="income"
        />

        <StatCard
          title="Monthly expenses"
          amount={monthlyStats.expenses }
          description={`Expenses recorded in ${formatMonth(activeMonth)}`}
          icon={ArrowUpRight}
          variant="expense"
        />

        <StatCard
          title="Net savings"
          amount={savings }
          description={
            savings < 0
              ? "You spent more than you earned"
              : "Income minus expenses"
          }
          icon={PiggyBank}
          variant="balance"
        />

        <StatCard
          title="Savings rate"
          amount={ savingsRate }
          description={
            monthlyStats.income > 0
              ? "Net savings as a percentage of income"
              : "Record income to calculate your rate"
          }
          icon={Percent}
          variant="balance"
        />
      </section>

      {/* Monthly cash flow */}
      <section className="charts-grid">
        <article className="panel cashflow-panel">
          <div className="panel-header">
            <div>
              <h2>Monthly cash flow</h2>
              <p>Income and expenses over the last six months</p>
            </div>

            <CalendarRange size={20} />
          </div>

          <div className="cashflow-chart">
            {transactions.length === 0 ? (
              <EmptyState
                title="No transaction data"
                description="Add transactions to see your monthly cash flow."
              />
            ) : (
              <CashFlowChart data={cashFlowData} variant="analytics" />
            )}
          </div>
        </article>

        {/* Selected month's categories */}
        <article className="panel category-panel analytics-pie-panel">
          <div className="panel-header">
            <div>
              <h2>Spending by category</h2>
              <p>Expenses for {formatMonth(activeMonth)}</p>
            </div>

            <ChartNoAxesCombined size={20} />
          </div>

          {categoryData.length === 0 ? (
            <EmptyState
              title="No expenses this month"
              description="Expense categories will appear here when you record spending."
            />
          ) : (
            <div className="donut-area analytics-donut-area">
              <ExpensePieChart
                data={categoryData}
                variant="donut"
                innerRadius="68%"
              />

              <div className="category-legend analytics-pie-legend">
                {categoryData.slice(0, 6).map((category) => {
                  const percentage =
                    totalSpent > 0 ? (category.value / totalSpent) * 100 : 0;

                  return (
                    <div
                      className="category-row analytics-pie-row"
                      key={category.name}
                    >
                      <div className="category-name">
                        <i
                          className="category-color"
                          style={{ background: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>

                      <div className="analytics-pie-values">
                        <strong>{formatYen(category.value)}</strong>
                        <span className="category-percent">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </article>
      </section>

      {/* Selected month's merchants */}
      <section className="panel analytics-merchants-panel">
        <div className="panel-header">
          <div>
            <h2>Top spending merchants</h2>
            <p>Highest recorded expenses in {formatMonth(activeMonth)}</p>
          </div>

          <TrendingDown size={20} />
        </div>

        {merchantData.length === 0 ? (
          <EmptyState
            title="No merchant expenses this month"
            description="Your highest-spending merchants will appear here."
          />
        ) : (
          <MerchantBarChart data={merchantData} />
        )}
      </section>

      {/* Selected month's transaction count */}
      <section className="panel analytics-month-summary">
        <div className="panel-header">
          <div>
            <h2>Month at a glance</h2>
            <p>{formatMonth(activeMonth)}</p>
          </div>

          <Wallet size={20} />
        </div>

        <div className="analytics-summary-row">
          <span>Recorded transactions</span>
          <strong>{selectedTransactions.length}</strong>
        </div>

        <div className="analytics-summary-row">
          <span>Average expense per expense transaction</span>
          <strong>
            {(() => {
              const expenseCount = selectedTransactions.filter(
                (transaction) => transaction.transaction_type === "expense",
              ).length;

              return formatYen(
                expenseCount > 0
                  ? monthlyStats.expenses / expenseCount
                  : 0,
              );
            })()}
          </strong>
        </div>
      </section>

      <PageFooter label="Analytics from recorded transactions" />
    </div>
  );
}
