"use client";

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@aah/ui";

export interface GPAHistoryData {
  semester: string;
  gpa: number;
  targetGpa?: number;
}

interface GPAHistoryChartProps {
  data: GPAHistoryData[];
  className?: string;
}

export function GPAHistoryChart({ data, className }: GPAHistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-64 text-gray-500",
          className,
        )}
      >
        No GPA history data available
      </div>
    );
  }

  return (
    <div className={cn("w-full h-64", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis dataKey="semester" className="text-xs" stroke="#6b7280" />
          <YAxis domain={[0, 4]} className="text-xs" stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="gpa"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
            name="Your GPA"
          />
          {data.some((d) => d.targetGpa !== undefined) && (
            <Line
              type="monotone"
              dataKey="targetGpa"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Target GPA"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
