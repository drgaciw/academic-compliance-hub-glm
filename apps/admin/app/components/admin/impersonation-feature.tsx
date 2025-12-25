"use client";

import * as React from "react";
import { Button } from "@aah/ui";
import { Badge } from "@aah/ui";
import { Shield } from "lucide-react";

interface ImpersonationFeatureProps {
  targetUserId: string;
  targetUserName: string;
  onImpersonate: (userId: string) => void;
  onStopImpersonation?: () => void;
  isImpersonating?: boolean;
}

export function ImpersonationFeature({
  targetUserId,
  targetUserName,
  onImpersonate,
  onStopImpersonation,
  isImpersonating = false,
}: ImpersonationFeatureProps) {
  const handleImpersonate = () => {
    if (
      confirm(
        `Are you sure you want to impersonate ${targetUserName}? This action will be logged for audit purposes.`,
      )
    ) {
      onImpersonate(targetUserId);
    }
  };

  const handleStop = () => {
    if (confirm("Are you sure you want to stop impersonating?")) {
      onStopImpersonation?.();
    }
  };

  if (isImpersonating) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-4 border border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
        <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
            Impersonating: {targetUserName}
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            All actions are being logged for audit purposes
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStop}
          className="bg-white dark:bg-gray-900"
        >
          Stop Impersonating
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button variant="outline" onClick={handleImpersonate} className="w-full">
        <Shield className="mr-2 h-4 w-4" />
        Impersonate User
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        This action will be logged for audit purposes
      </p>
    </div>
  );
}
