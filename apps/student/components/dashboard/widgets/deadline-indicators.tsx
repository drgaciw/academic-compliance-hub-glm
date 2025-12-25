"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@aah/ui";

export interface Deadline {
  id: string;
  title: string;
  dueDate: Date;
  status: "pending" | "warning" | "critical" | "completed";
  type: "compliance" | "academic" | "document";
}

interface DeadlineIndicatorsProps {
  deadlines: Deadline[];
  className?: string;
}

export function DeadlineIndicators({
  deadlines,
  className,
}: DeadlineIndicatorsProps) {
  const [timeRemaining, setTimeRemaining] = useState<
    Record<string, { days: number; hours: number }>
  >({});

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const remaining: Record<string, { days: number; hours: number }> = {};

      deadlines.forEach((deadline) => {
        if (deadline.status === "completed") return;

        const now = new Date();
        const due = new Date(deadline.dueDate);
        const diff = due.getTime() - now.getTime();

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );

        remaining[deadline.id] = { days, hours };
      });

      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [deadlines]);

  const getStatusIcon = (status: Deadline["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: Deadline["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "critical":
        return "border-red-200 bg-red-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const getTypeBadge = (type: Deadline["type"]) => {
    const colors = {
      compliance: "bg-purple-100 text-purple-700",
      academic: "bg-blue-100 text-blue-700",
      document: "bg-green-100 text-green-700",
    };

    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
          colors[type],
        )}
      >
        {type}
      </span>
    );
  };

  const sortedDeadlines = [...deadlines].sort((a, b) => {
    if (a.status === "completed") return 1;
    if (b.status === "completed") return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  if (!deadlines || deadlines.length === 0) {
    return (
      <div className={cn("text-center text-gray-500 py-8", className)}>
        No upcoming deadlines
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {sortedDeadlines.map((deadline) => {
        if (deadline.status === "completed") return null;

        const time = timeRemaining[deadline.id];
        const isCritical = time?.days !== undefined && time.days <= 3;
        const displayStatus = isCritical ? "critical" : deadline.status;

        return (
          <div
            key={deadline.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border",
              getStatusColor(displayStatus),
            )}
          >
            {getStatusIcon(displayStatus)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {deadline.title}
                </p>
                {getTypeBadge(deadline.type)}
              </div>
              {time && (
                <p
                  className={cn(
                    "text-xs",
                    isCritical ? "text-red-600 font-semibold" : "text-gray-600",
                  )}
                >
                  {time.days > 0
                    ? `${time.days} day${time.days !== 1 ? "s" : ""} remaining`
                    : time.hours > 0
                      ? `${time.hours} hour${time.hours !== 1 ? "s" : ""} remaining`
                      : "Due soon"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
