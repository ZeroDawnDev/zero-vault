import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryDatum } from "../utils/analytics";
import { getTotalSpent } from "../utils/analytics";
import { formatYen } from "../utils/formatters";

interface ExpensePieChartProps {
  data: CategoryDatum[];
  /**
   * "donut"  – responsive donut with the total in the centre (Overview, Analytics)
   * "plain"  – fixed-height ring without a centre label (Categories)
   */
  variant?: "donut" | "plain";
  innerRadius?: string | number;
}

const donutTooltip = {
  background: "#1B1E21",
  border: "1px solid #34393E",
  borderRadius: 12,
  color: "#F2F4F3",
  fontSize: 12,
};

const plainTooltip = {
  background: "#17191F",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#F4F5F7",
};

export function ExpensePieChart({
  data,
  variant = "donut",
  innerRadius,
}: ExpensePieChartProps) {
  if (variant === "plain") {
    return (
      <div style={{ width: "100%", height: 300, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={innerRadius ?? 65}
              outerRadius={100}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatYen(value)}
              contentStyle={plainTooltip}
              labelStyle={{ color: "#F4F5F7" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="donut-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius ?? "70%"}
            outerRadius="92%"
            paddingAngle={3}
            stroke="none"
          >
            {data.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatYen(value)} contentStyle={donutTooltip} />
        </PieChart>
      </ResponsiveContainer>

      <div className="donut-center">
        <span>TOTAL SPENT</span>
        <strong>{formatYen(getTotalSpent(data))}</strong>
      </div>
    </div>
  );
}
