"use client";

import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  draft: "#1D3557",
  in_progress: "#2A9D8F",
  under_review: "#E9C46A",
  approved: "#3AB5A6",
  published: "#2B4A7A",
  challenged: "#E76F51",
  withdrawn: "#ADB5BD",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  under_review: "Under Review",
  approved: "Approved",
  published: "Published",
  challenged: "Challenged",
  withdrawn: "Withdrawn",
};

interface StatusChartProps {
  data: Record<string, number>;
}

export function StatusChart({ data }: StatusChartProps) {
  const chartData = Object.entries(data)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] ?? status,
      value: count,
      color: STATUS_COLORS[status] ?? "#6C757D",
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-text-muted">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [String(value), "Decisions"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #DEE2E6",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-xs text-text-secondary">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
