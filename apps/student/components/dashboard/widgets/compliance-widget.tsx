"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "@aah/ui";

interface Requirement {
  id: string;
  name: string;
  status: "complete" | "in_progress" | "pending";
  details?: string[];
}

interface ComplianceWidgetProps {
  requirements: Requirement[];
  className?: string;
}

export function ComplianceWidget({
  requirements,
  className,
}: ComplianceWidgetProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: Requirement["status"]) => {
    switch (status) {
      case "complete":
        return (
          <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
        );
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-600" aria-hidden="true" />;
      case "pending":
        return <XCircle className="h-5 w-5 text-gray-400" aria-hidden="true" />;
    }
  };

  const completedCount = requirements.filter(
    (r) => r.status === "complete",
  ).length;
  const totalCount = requirements.length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-500">Progress</span>
          <span className="font-semibold text-gray-900">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-green-600 transition-all"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {requirements.map((requirement) => (
          <div
            key={requirement.id}
            className="rounded-lg border border-gray-200 bg-white"
          >
            <button
              className="flex w-full items-center gap-3 p-3 text-left hover:bg-gray-50"
              onClick={() =>
                requirement.details && toggleExpand(requirement.id)
              }
              aria-expanded={expandedItems.has(requirement.id)}
            >
              {getStatusIcon(requirement.status)}
              <span className="flex-1 font-medium text-gray-900">
                {requirement.name}
              </span>
              {requirement.details && (
                <span className="text-gray-400">
                  {expandedItems.has(requirement.id) ? (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
              )}
            </button>
            {requirement.details && expandedItems.has(requirement.id) && (
              <div className="border-t border-gray-200 p-3">
                <ul className="space-y-2">
                  {requirement.details.map((detail, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-gray-400" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
