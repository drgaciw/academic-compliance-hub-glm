"use client";

import { Check, X, ArrowRight } from "lucide-react";
import { cn } from "@aah/ui";

export interface CourseEquivalency {
  id: string;
  sourceCourse: {
    code: string;
    name: string;
    credits: number;
  };
  targetCourse?: {
    code: string;
    name: string;
    credits: number;
  };
  status: "matched" | "partial" | "unmatched" | "pending";
  notes?: string;
}

interface CourseEquivalencyPreviewProps {
  equivalencies: CourseEquivalency[];
  className?: string;
}

export function CourseEquivalencyPreview({
  equivalencies,
  className,
}: CourseEquivalencyPreviewProps) {
  const getStatusIcon = (status: CourseEquivalency["status"]) => {
    switch (status) {
      case "matched":
        return <Check className="h-4 w-4 text-green-600" />;
      case "partial":
        return <ArrowRight className="h-4 w-4 text-yellow-600" />;
      case "unmatched":
        return <X className="h-4 w-4 text-red-600" />;
      case "pending":
        return <ArrowRight className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: CourseEquivalency["status"]) => {
    switch (status) {
      case "matched":
        return "bg-green-50 border-green-200";
      case "partial":
        return "bg-yellow-50 border-yellow-200";
      case "unmatched":
        return "bg-red-50 border-red-200";
      case "pending":
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status: CourseEquivalency["status"]) => {
    switch (status) {
      case "matched":
        return "Direct Match";
      case "partial":
        return "Partial Credit";
      case "unmatched":
        return "No Equivalent";
      case "pending":
        return "Pending Review";
    }
  };

  if (!equivalencies || equivalencies.length === 0) {
    return (
      <div
        className={cn(
          "text-center text-gray-500 py-8 border border-dashed rounded-lg",
          className,
        )}
      >
        No courses to display
      </div>
    );
  }

  const summary = {
    matched: equivalencies.filter((e) => e.status === "matched").length,
    partial: equivalencies.filter((e) => e.status === "partial").length,
    unmatched: equivalencies.filter((e) => e.status === "unmatched").length,
    totalCredits: equivalencies.reduce(
      (sum, e) => sum + e.sourceCourse.credits,
      0,
    ),
    matchedCredits: equivalencies
      .filter((e) => e.status === "matched")
      .reduce((sum, e) => sum + e.sourceCourse.credits, 0),
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500">Total Credits</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary.totalCredits}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Transferable Credits</p>
          <p className="text-2xl font-bold text-green-600">
            {summary.matchedCredits}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {equivalencies.map((equiv) => (
          <div
            key={equiv.id}
            className={cn(
              "p-4 rounded-lg border",
              getStatusColor(equiv.status),
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(equiv.status)}
                <span className="text-sm font-medium text-gray-900">
                  {getStatusText(equiv.status)}
                </span>
              </div>
              {equiv.targetCourse && (
                <span className="text-xs text-gray-500">
                  {equiv.targetCourse.credits} credits
                </span>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">Your Course</p>
                <p className="text-sm font-semibold text-gray-900">
                  {equiv.sourceCourse.code}
                </p>
                <p className="text-sm text-gray-700">
                  {equiv.sourceCourse.name}
                </p>
                <p className="text-xs text-gray-500">
                  {equiv.sourceCourse.credits} credits
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">Transfer To</p>
                {equiv.targetCourse ? (
                  <>
                    <p className="text-sm font-semibold text-gray-900">
                      {equiv.targetCourse.code}
                    </p>
                    <p className="text-sm text-gray-700">
                      {equiv.targetCourse.name}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No equivalent course
                  </p>
                )}
              </div>
            </div>

            {equiv.notes && (
              <p className="mt-3 text-xs text-gray-600 italic">
                Note: {equiv.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
