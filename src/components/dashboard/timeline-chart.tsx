"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TimelineChartProps {
  data: Array<{ month: string; count: number }>;
}

export function TimelineChart({ data }: TimelineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-text-muted">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2A9D8F" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2A9D8F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6C757D" }} />
        <YAxis tick={{ fontSize: 12, fill: "#6C757D" }} allowDecimals={false} />
        <Tooltip
          formatter={(value) => [String(value), "Decisions"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #DEE2E6",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#2A9D8F"
          strokeWidth={2}
          fill="url(#accentGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
