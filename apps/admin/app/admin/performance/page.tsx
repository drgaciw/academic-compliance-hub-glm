"use client";

import { useEffect, useState } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  unit?: string;
}

function MetricCard({ title, value, change, unit }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-lg text-gray-600 ml-1">{unit}</span>}
      </div>
      {change !== undefined && (
        <div
          className={`text-sm mt-2 ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {change}% from last period
        </div>
      )}
    </div>
  );
}

export default function PerformanceDashboard() {
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    const event = new CustomEvent("speed-insights-filter", {
      detail: { timeRange },
    });
    window.dispatchEvent(event);
  }, [timeRange]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Performance Dashboard</h1>
        <p className="text-gray-600">
          Real-time performance metrics and web vitals across all microsites
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {range === "24h"
                ? "24 Hours"
                : range === "7d"
                  ? "7 Days"
                  : "30 Days"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Average LCP" value="2.1" unit="s" change={-12} />
        <MetricCard title="Average FID" value="45" unit="ms" change={8} />
        <MetricCard title="Average CLS" value="0.05" change={-15} />
        <MetricCard title="Pages Tracked" value="1,247" change={23} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Core Web Vitals</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Largest Contentful Paint
                </span>
                <span className="text-sm text-gray-600">Good: &lt;2.5s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "84%" }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 mt-1">2.1s average</div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">First Input Delay</span>
                <span className="text-sm text-gray-600">Good: &lt;100ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "55%" }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 mt-1">45ms average</div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Cumulative Layout Shift
                </span>
                <span className="text-sm text-gray-600">Good: &lt;0.1</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "50%" }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 mt-1">0.05 average</div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Page Load Distribution</h2>
          <div className="space-y-4">
            {[
              { name: "Fast (&lt;2.5s)", count: 847, percent: 68 },
              { name: "Moderate (2.5-4s)", count: 298, percent: 24 },
              { name: "Slow (4-8s)", count: 87, percent: 7 },
              { name: "Very Slow (&gt;8s)", count: 15, percent: 1 },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600">
                    {item.count} ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.percent >= 68
                        ? "bg-green-500"
                        : item.percent >= 24
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Top Pages by Traffic</h2>
          <div className="space-y-2">
            {[
              { path: "/dashboard", views: 3421, avgLoad: 1.8 },
              { path: "/transfer-credit", views: 2189, avgLoad: 2.3 },
              { path: "/transcripts", views: 1876, avgLoad: 2.1 },
              { path: "/eligibility", views: 1543, avgLoad: 2.5 },
              { path: "/documents", views: 1234, avgLoad: 2.7 },
            ].map((page, index) => (
              <div
                key={page.path}
                className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">
                    #{index + 1}
                  </span>
                  <span className="font-medium">{page.path}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>{page.views.toLocaleString()} views</span>
                  <span>{page.avgLoad}s avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Performance by Device</h2>
          <div className="space-y-4">
            {[
              { device: "Desktop", users: 893, avgLCP: 1.8 },
              { device: "Mobile", users: 1247, avgLCP: 2.4 },
              { device: "Tablet", users: 107, avgLCP: 2.2 },
            ].map((item) => (
              <div key={item.device}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.device}</span>
                  <span className="text-sm text-gray-600">
                    {item.users} users
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-full bg-gray-200 rounded-full h-2 flex-1">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(item.users / 1247) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="w-20 text-right">{item.avgLCP}s LCP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
