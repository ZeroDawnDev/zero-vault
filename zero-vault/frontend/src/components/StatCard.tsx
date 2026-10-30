import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { formatYen } from "../utils/formatters";

interface StatCardProps {
  title: string;
  amount: number;
  description: string;
  icon: LucideIcon;
  variant: "balance" | "income" | "expense";
  /** "currency" formats as JPY (default); "count" shows a plain number. */
  format?: "currency" | "count";
}

export function StatCard({
  title,
  amount,
  description,
  icon: Icon,
  variant,
  format = "currency",
}: StatCardProps) {
  return (
    <article className={`stat-card stat-${variant}`}>
      <div className="stat-top">
        <div className="stat-label">
          <span className={`stat-icon icon-${variant}`}>
            <Icon size={19} strokeWidth={1.8} />
          </span>
          <span>{title}</span>
        </div>

        <button
          className="icon-button subtle-button"
          aria-label={`More ${title} options`}
        >
          <MoreHorizontal size={19} />
        </button>
      </div>

      <div className="stat-amount">
        {format === "count" ? amount.toLocaleString("ja-JP") : formatYen(amount)}
      </div>

      <div className="stat-bottom">
        <span className={`status-dot dot-${variant}`} />
        <span>{description}</span>
      </div>
    </article>
  );
}
