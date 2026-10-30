import {
  Activity,
  ArrowUpRight,
  ChartNoAxesCombined,
  LoaderCircle,
  Package,
  Tags,
} from "lucide-react";
import { CategoryBarChart } from "../charts/CategoryBarChart";
import { ExpensePieChart } from "../charts/ExpensePieChart";
import { PageFooter } from "../components/PageFooter";
import { StatCard } from "../components/StatCard";
import type { DashboardSummary, Transaction } from "../types/transaction";
import type { CategoryDatum } from "../utils/analytics";
import { numberValue } from "../utils/formatters";

interface CategoriesProps {
  summary: DashboardSummary | null;
  transactions: Transaction[];
  categoryData: CategoryDatum[];
  loading: boolean;
  onRefresh: () => void;
}

export function Categories({
  summary,
  transactions,
  categoryData,
  loading,
  onRefresh,
}: CategoriesProps) {
  const expenseCount = transactions.filter(
    (transaction) => transaction.transaction_type === "expense",
  ).length;

  return (
    <div className="categories-page">
      <section className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            SPENDING ORGANIZATION
          </div>
          <h1>Your categories.</h1>
          <p className="page-subtitle">
            See how your expenses are distributed across categories.
          </p>
        </div>

        <button className="button button-secondary" onClick={onRefresh} disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={17} /> : <Activity size={17} />}
          Refresh data
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          title="Total categories"
          amount={categoryData.length}
          description="Categories with expenses"
          icon={Tags}
          variant="balance"
          format="count"
        />
        <StatCard
          title="Total expenses"
          amount={numberValue(summary?.total_expenses)}
          description="All recorded expenses"
          icon={ArrowUpRight}
          variant="expense"
        />
        <StatCard
          title="Transactions"
          amount={expenseCount}
          description="Recorded expense entries"
          icon={Package}
          variant="income"
          format="count"
        />
      </section>

      {categoryData.length > 0 && (
        <div
          className="category-charts-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Expense distribution</h2>
                <p>How your recorded expenses are divided</p>
              </div>
              <Tags size={20} />
            </div>

            <ExpensePieChart data={categoryData} variant="plain" />

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px 16px",
                padding: "0 8px 12px",
              }}
            >
              {categoryData.map((category) => (
                <div
                  key={category.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 12,
                    color: "#A5AAB7",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: category.color,
                      flexShrink: 0,
                    }}
                  />
                  {category.name}
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Spending by category</h2>
                <p>Compare total expenses across categories</p>
              </div>
              <ChartNoAxesCombined size={20} />
            </div>

            <CategoryBarChart data={categoryData} />
          </section>
        </div>
      )}

      <PageFooter label="Categories from recorded transactions" />
    </div>
  );
}
