"use client";

import { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@aah/ui";

interface WidgetWrapperProps {
  children: ReactNode;
  title?: string;
  className?: string;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
}

export function WidgetWrapper({
  children,
  title,
  className,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
}: WidgetWrapperProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
        draggable && "cursor-move",
        className,
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {draggable && (
            <GripVertical
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          )}
        </div>
      )}
      {children}
    </div>
  );
}
