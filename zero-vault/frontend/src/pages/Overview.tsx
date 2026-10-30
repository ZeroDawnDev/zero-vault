import { Activity, ArrowDownLeft, ArrowUpRight, LoaderCircle, MoreHorizontal, Plus, Wallet } from "lucide-react";
import { CashFlowChart } from "../charts/CashFlowChart";
import { ExpensePieChart } from "../charts/ExpensePieChart";
import { EmptyState } from "../components/EmptyState";
import { PageFooter } from "../components/PageFooter";
import { StatCard } from "../components/StatCard";
import {
  TransactionsPanel,
  type TransactionFilter,
} from "../components/TransactionsPanel";
import type { DashboardSummary, Transaction } from "../types/transaction";
import {
  getTotalSpent,
  type CategoryDatum,
  type MonthlyDatum,
} from "../utils/analytics";
import { formatYen, getGreeting, numberValue } from "../utils/formatters";

interface OverviewProps {
  summary: DashboardSummary | null;
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  monthlyData: MonthlyDatum[];
  categoryData: CategoryDatum[];
  currentMonthExpenses: number;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  filter: TransactionFilter;
  onFilterChange: (value: TransactionFilter) => void;
  onRefresh: () => void;
  onAddTransaction: () => void;
  onViewAll: () => void;
}

export function Overview({
  summary,
  transactions,
  filteredTransactions,
  monthlyData,
  categoryData,
  currentMonthExpenses,
  loading,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onRefresh,
  onAddTransaction,
  onViewAll,
}: OverviewProps) {
  const totalSpent = getTotalSpent(categoryData);

  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            PERSONAL FINANCE
          </div>
          <h1>{getGreeting()}.</h1>
          <p className="page-subtitle">Here’s what’s happening with your money.</p>
        </div>

        <div className="heading-actions">
          <button className="button button-secondary" onClick={onRefresh} disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={17} /> : <Activity size={17} />}
            <span>Refresh</span>
          </button>

          <button className="button button-primary" onClick={onAddTransaction}>
            <Plus size={18} strokeWidth={2.2} />
            <span>Add transaction</span>
          </button>
        </div>
      </section>

      <section className="stats-grid">
        {loading && !summary ? (
          <>
            <div className="stat-skeleton" />
            <div className="stat-skeleton" />
            <div className="stat-skeleton" />
          </>
        ) : (
          <>
            <StatCard
              title="Total balance"
              amount={numberValue(summary?.balance)}
              description="Income minus expenses"
              icon={Wallet}
              variant="balance"
            />
            <StatCard
              title="Total income"
              amount={numberValue(summary?.total_income)}
              description="All recorded income"
              icon={ArrowDownLeft}
              variant="income"
            />
            <StatCard
              title="Total expenses"
              amount={numberValue(summary?.total_expenses)}
              description="All recorded expenses"
              icon={ArrowUpRight}
              variant="expense"
            />
          </>
        )}
      </section>

      <section className="insight-strip">
        <div className="insight-icon">
          <Activity size={18} />
        </div>
        <div className="insight-copy">
          <span className="insight-label">MONTHLY SNAPSHOT</span>
          <span className="insight-text">
            You’ve recorded <strong>{formatYen(currentMonthExpenses)}</strong> in
            expenses this month.
          </span>
        </div>
        <div className="insight-count">
          <span>{transactions.length}</span>
          <small>transactions loaded</small>
        </div>
      </section>

      <section className="charts-grid">
        <article className="panel cashflow-panel">
          <div className="panel-header">
            <div>
              <h2>Cash flow</h2>
              <p>Income and expenses over the last six months</p>
            </div>
            <button className="icon-button" aria-label="Cash flow options">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="chart-legend">
            <span>
              <i className="legend-dot legend-income" />
              Income
            </span>
            <span>
              <i className="legend-dot legend-expense" />
              Expenses
            </span>
          </div>

          <div className="cashflow-chart">
            {transactions.length === 0 ? (
              <EmptyState
                title="Your cash flow starts here"
                description="Add transactions to see your income and expenses over time."
              />
            ) : (
              <CashFlowChart data={monthlyData} variant="overview" />
            )}
          </div>

          <div className="chart-footer">
            <span>
              <span className="footer-live-dot" />
              Based on recorded transactions
            </span>
            <span>Last 6 months</span>
          </div>
        </article>

        <article className="panel category-panel">
          <div className="panel-header">
            <div>
              <h2>Spending breakdown</h2>
              <p>Where your money goes</p>
            </div>
            <button className="icon-button" aria-label="Spending breakdown options">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="donut-area">
            {categoryData.length === 0 ? (
              <EmptyState
                title="Nothing to break down"
                description="Expense categories will appear here as you add transactions."
              />
            ) : (
              <>
                <ExpensePieChart data={categoryData} variant="donut" />

                <div className="category-legend">
                  {categoryData.slice(0, 5).map((item) => {
                    const percentage =
                      totalSpent > 0 ? Math.round((item.value / totalSpent) * 100) : 0;

                    return (
                      <div className="category-row" key={item.name}>
                        <div className="category-name">
                          <i className="category-color" style={{ background: item.color }} />
                          <span>{item.name}</span>
                        </div>
                        <span className="category-percent">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </article>
      </section>

      <TransactionsPanel
        mode="overview"
        transactions={filteredTransactions}
        totalCount={transactions.length}
        loading={loading}
        search={search}
        onSearchChange={onSearchChange}
        filter={filter}
        onFilterChange={onFilterChange}
        onViewAll={onViewAll}
      />

      <PageFooter label="Your financial overview" />
    </>
  );
}
