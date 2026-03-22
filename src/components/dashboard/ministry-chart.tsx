"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MinistryChartProps {
  data: Array<{ name: string; count: number }>;
}

export function MinistryChart({ data }: MinistryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-text-muted">
        No data available
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, sorted.length * 48)}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: "#6C757D" }} />
        <YAxis
          type="category"
          dataKey="name"
          width={180}
          tick={{ fontSize: 12, fill: "#212529" }}
        />
        <Tooltip
          formatter={(value) => [String(value), "Decisions"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #DEE2E6",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Bar dataKey="count" fill="#2A9D8F" radius={[0, 4, 4, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
