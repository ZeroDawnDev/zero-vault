import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyDatum } from "../utils/analytics";
import { formatYen } from "../utils/formatters";

interface CashFlowChartProps {
  data: MonthlyDatum[];
  variant?: "overview" | "analytics";
}

const config = {
  overview: {
    prefix: "",
    incomeOpacity: 0.22,
    expenseOpacity: 0.15,
    margin: { top: 10, right: 4, left: -18, bottom: 0 },
    tickDy: 10,
  },
  analytics: {
    prefix: "analytics",
    incomeOpacity: 0.3,
    expenseOpacity: 0.2,
    margin: undefined,
    tickDy: undefined,
  },
} as const;

export function CashFlowChart({ data, variant = "overview" }: CashFlowChartProps) {
  const c = config[variant];
  const incomeId = c.prefix ? `${c.prefix}IncomeGradient` : "incomeGradient";
  const expenseId = c.prefix ? `${c.prefix}ExpenseGradient` : "expenseGradient";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={c.margin}>
        <defs>
          <linearGradient id={incomeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B6F09C" stopOpacity={c.incomeOpacity} />
            <stop offset="95%" stopColor="#B6F09C" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={expenseId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0A1A1" stopOpacity={c.expenseOpacity} />
            <stop offset="95%" stopColor="#F0A1A1" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke="#292D31" strokeDasharray="3 5" vertical={false} />

        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#777F87", fontSize: 11 }}
          dy={c.tickDy}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#777F87", fontSize: 10 }}
          tickFormatter={(value: number) =>
            value >= 1000 ? `¥${Math.round(value / 1000)}k` : `¥${value}`
          }
        />

        <Tooltip
          contentStyle={{
            background: "#1B1E21",
            border: "1px solid #34393E",
            borderRadius: 12,
            color: "#F2F4F3",
            fontSize: 12,
          }}
          formatter={(value) => formatYen(value)}
          labelStyle={{ color: "#A4AAA8", marginBottom: 6 }}
        />

        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#B6F09C"
          strokeWidth={2}
          fill={`url(#${incomeId})`}
          activeDot={{ r: 4, fill: "#B6F09C", stroke: "#171A1D", strokeWidth: 2 }}
        />

        <Area
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke="#F0A1A1"
          strokeWidth={2}
          fill={`url(#${expenseId})`}
          activeDot={{ r: 4, fill: "#F0A1A1", stroke: "#171A1D", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
