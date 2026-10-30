import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryDatum } from "../utils/analytics";
import { formatYen } from "../utils/formatters";

interface CategoryBarChartProps {
  data: CategoryDatum[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  return (
    <div
      style={{
        width: "100%",
        height: Math.min(480, Math.max(280, data.length * 48)),
        marginTop: 12,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 20, left: 8, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="rgba(255,255,255,0.09)"
          />
          <XAxis
            type="number"
            tickFormatter={(value) => `¥${Number(value).toLocaleString("ja-JP")}`}
            tick={{ fill: "#9297A5", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fill: "#E6E8EE", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => formatYen(value)}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "#17191F",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              color: "#F4F5F7",
            }}
            labelStyle={{ color: "#F4F5F7" }}
          />
          <Bar dataKey="value" name="Total expenses" radius={[0, 6, 6, 0]} maxBarSize={25}>
            {data.map((category) => (
              <Cell key={category.name} fill={category.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
