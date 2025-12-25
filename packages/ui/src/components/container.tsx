import * as React from "react";

import { cn } from "../lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
}

function Container({ padding = "md", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full",
        {
          "p-0": padding === "none",
          "p-2": padding === "xs",
          "p-4": padding === "sm",
          "p-6": padding === "md",
          "p-8": padding === "lg",
          "p-12": padding === "xl",
        },
        className,
      )}
      {...props}
    />
  );
}

export { Container };
export type { ContainerProps };
