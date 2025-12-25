"use client";

import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-7xl">{children}</div>
    </main>
  );
}

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{title}</h1>
      {description && <p className="mt-2 text-gray-600">{description}</p>}
    </header>
  );
}

interface DashboardGridProps {
  children: ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </section>
  );
}

interface WidgetGridProps {
  children: ReactNode;
}

export function WidgetGrid({ children }: WidgetGridProps) {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </section>
  );
}
