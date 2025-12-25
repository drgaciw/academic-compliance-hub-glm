"use client";

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-lg border border-gray-200 bg-white p-6"
        >
          <div className="mb-4 h-6 w-3/4 rounded bg-gray-200" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-4/6 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="h-48 animate-pulse rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 h-6 w-3/4 rounded bg-gray-200" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
        <div className="h-4 w-4/6 rounded bg-gray-200" />
      </div>
    </div>
  );
}
