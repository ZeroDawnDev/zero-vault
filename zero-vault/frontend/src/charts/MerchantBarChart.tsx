import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MerchantDatum } from "../utils/analytics";
import { formatYen } from "../utils/formatters";

interface MerchantBarChartProps {
  data: MerchantDatum[];
}

export function MerchantBarChart({ data }: MerchantBarChartProps) {
  return (
    <div style={{ width: "100%", height: 280, marginTop: 12 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 12, bottom: 8 }}
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
            dataKey="merchant"
            width={190}
            tick={{ fill: "#E6E8EE", fontSize: 12 }}
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
          <Bar
            dataKey="amount"
            name="Recorded expenses"
            fill="#B6F09C"
            radius={[0, 6, 6, 0]}
            maxBarSize={25}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
