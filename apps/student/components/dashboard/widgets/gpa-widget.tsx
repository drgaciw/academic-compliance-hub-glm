"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@aah/ui";

interface GPAWidgetProps {
  gpa: number;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
  className?: string;
}

export function GPAWidget({
  gpa,
  trend = "stable",
  trendValue,
  className,
}: GPAWidgetProps) {
  const formattedGPA = gpa.toFixed(2);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">Current GPA</span>
        {trend !== "stable" && trendValue !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend === "up" ? "text-green-600" : "text-red-600",
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-4 w-4" aria-hidden="true" />
            )}
            {Math.abs(trendValue).toFixed(2)}
          </div>
        )}
      </div>
      <div className="text-4xl font-bold text-gray-900">{formattedGPA}</div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Overall</span>
          <span className="font-medium text-gray-900">{formattedGPA}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${(gpa / 4.0) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
