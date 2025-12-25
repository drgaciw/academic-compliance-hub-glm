"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

export interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  items: NavItem[];
  basePath?: string;
  variant?: "desktop" | "mobile";
}

export function Navigation({
  items,
  basePath = "",
  variant = "desktop",
  className,
  ...props
}: NavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === basePath || pathname === basePath + "/";
    }
    return pathname.startsWith(basePath + href) || pathname === basePath + href;
  };

  if (variant === "mobile") {
    return (
      <nav className={cn("flex flex-col space-y-1", className)} {...props}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={`${basePath}${item.href}`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.icon && <span className="h-5 w-5">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[0.625rem] font-semibold text-primary-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav
      className={cn("flex items-center gap-1", className)}
      {...props}
      aria-label="Main navigation"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={`${basePath}${item.href}`}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isActive(item.href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          {item.icon && <span className="h-4 w-4">{item.icon}</span>}
          <span>{item.label}</span>
          {item.badge && (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 text-[0.625rem] font-semibold text-destructive-foreground">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
