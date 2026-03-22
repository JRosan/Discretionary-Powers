"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StepBottleneckChartProps {
  data: Array<{ step: string; avgDays: number }>;
}

export function StepBottleneckChart({ data }: StepBottleneckChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-text-muted">
        No data available
      </div>
    );
  }

  const maxDays = Math.max(...data.map((d) => d.avgDays));

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ left: 30, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: "#6C757D" }}
          label={{ value: "Avg. Days", position: "insideBottom", offset: -2, fontSize: 12, fill: "#6C757D" }}
        />
        <YAxis
          type="category"
          dataKey="step"
          width={180}
          tick={{ fontSize: 11, fill: "#212529" }}
        />
        <Tooltip
          formatter={(value) => [`${value} days`, "Avg. Duration"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #DEE2E6",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Bar dataKey="avgDays" radius={[0, 4, 4, 0]} barSize={22}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.avgDays === maxDays ? "#E76F51" : "#2A9D8F"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
