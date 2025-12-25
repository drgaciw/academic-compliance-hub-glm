"use client";

import { useState } from "react";
import { Progress } from "@aah/ui";
import { cn } from "@aah/ui";

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

interface UploadProgressIndicatorProps {
  uploads: UploadProgress[];
  className?: string;
}

export function UploadProgressIndicator({
  uploads,
  className,
}: UploadProgressIndicatorProps) {
  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold">Upload Progress</h3>
      <div className="space-y-2">
        {uploads.map((upload, index) => (
          <div
            key={`${upload.fileName}-${index}`}
            className="space-y-1 rounded-md border p-3 bg-card"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium truncate flex-1">
                {upload.fileName}
              </p>
              <span
                className={cn(
                  "ml-2 text-xs font-medium",
                  upload.status === "completed" && "text-green-600",
                  upload.status === "error" && "text-red-600",
                  upload.status === "uploading" && "text-blue-600",
                )}
              >
                {upload.status === "uploading" && `${upload.progress}%`}
                {upload.status === "completed" && "Complete"}
                {upload.status === "error" && "Failed"}
              </span>
            </div>
            {upload.status === "uploading" && (
              <Progress value={upload.progress} className="h-2" />
            )}
            {upload.status === "error" && upload.error && (
              <p className="text-xs text-red-600">{upload.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
