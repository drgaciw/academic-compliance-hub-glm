import * as React from "react";
import { cn } from "../lib/utils";

export interface SkipLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  targetId?: string;
}

export function SkipToContent({
  targetId = "main-content",
  className,
  ...props
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]",
        "focus:inline-flex focus:h-10 focus:items-center focus:rounded-md focus:px-4",
        "focus:bg-primary focus:text-primary-foreground focus:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-all",
        className,
      )}
      {...props}
    >
      Skip to main content
    </a>
  );
}
