"use client";

import { CheckCircle2, Clock, XCircle, Calendar } from "lucide-react";
import { cn } from "@aah/ui";

export interface ComplianceHistoryEntry {
  id: string;
  date: Date;
  action: string;
  status: "complete" | "in_progress" | "pending" | "failed";
  description?: string;
  category?: string;
}

interface ComplianceTimelineProps {
  entries: ComplianceHistoryEntry[];
  className?: string;
}

export function ComplianceTimeline({
  entries,
  className,
}: ComplianceTimelineProps) {
  const getStatusIcon = (status: ComplianceHistoryEntry["status"]) => {
    switch (status) {
      case "complete":
        return (
          <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
        );
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-600" aria-hidden="true" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" aria-hidden="true" />;
    }
  };

  const getStatusColor = (status: ComplianceHistoryEntry["status"]) => {
    switch (status) {
      case "complete":
        return "bg-green-600";
      case "in_progress":
        return "bg-yellow-600";
      case "failed":
        return "bg-red-600";
      default:
        return "bg-gray-300";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (!entries || entries.length === 0) {
    return (
      <div className={cn("text-center text-gray-500 py-8", className)}>
        No compliance history
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {sortedEntries.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-white",
                getStatusColor(entry.status),
              )}
            >
              {getStatusIcon(entry.status)}
            </div>
            {index < sortedEntries.length - 1 && (
              <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
            )}
          </div>

          <div className="flex-1 pb-6">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-900">
                {entry.action}
              </p>
              {entry.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  {entry.category}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <Calendar className="h-3 w-3" />
              {formatDate(entry.date)}
            </div>

            {entry.description && (
              <p className="text-sm text-gray-600">{entry.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
