"use client";

import { useState } from "react";

interface LogEntry {
  level: string;
  timestamp: string;
  service: string;
  userId?: string;
  message: string;
  error?: {
    message: string;
  };
  metadata?: Record<string, unknown>;
}

export default function LogSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState({
    level: "",
    service: "",
    timeRange: "1h",
  });

  const handleSearch = async () => {
    try {
      const response = await fetch("/api/admin/logs/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          filters,
        }),
      });

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to search logs:", error);
    }
  };

  const exportLogs = async () => {
    const response = await fetch("/api/admin/logs/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: searchQuery, filters }),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Log Search</h1>
        <p className="text-gray-600">
          Search and analyze application logs across all microsites
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search logs... (e.g., 'error', userId:123, /api/transfer-credit)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Levels</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
        <select
          value={filters.service}
          onChange={(e) => setFilters({ ...filters, service: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Services</option>
          <option value="api">API</option>
          <option value="user-action">User Actions</option>
          <option value="performance">Performance</option>
          <option value="log-ingestion">Log Ingestion</option>
        </select>
        <select
          value={filters.timeRange}
          onChange={(e) =>
            setFilters({ ...filters, timeRange: e.target.value })
          }
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="15m">Last 15 minutes</option>
          <option value="1h">Last hour</option>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
        <button
          onClick={exportLogs}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Export
        </button>
      </div>

      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No logs found. Enter a search query to get started.
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                log.level === "error"
                  ? "border-red-300 bg-red-50"
                  : log.level === "warn"
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-gray-300 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      log.level === "error"
                        ? "bg-red-600 text-white"
                        : log.level === "warn"
                          ? "bg-yellow-600 text-white"
                          : log.level === "info"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-600 text-white"
                    }`}
                  >
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">{log.timestamp}</span>
                  <span className="text-sm text-gray-600">{log.service}</span>
                </div>
                {log.userId && (
                  <span className="text-sm text-gray-600">
                    User: {log.userId}
                  </span>
                )}
              </div>
              <div className="text-sm font-medium mb-1">{log.message}</div>
              {log.error && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                  {log.error.message}
                </div>
              )}
              {log.metadata && (
                <details className="mt-2">
                  <summary className="text-sm text-blue-600 cursor-pointer">
                    View Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
