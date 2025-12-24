"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@aah/ui";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Zap,
  Activity,
  Clock,
  Server,
  Database,
  Globe,
  RefreshCw,
} from "lucide-react";

const generateRealTimeData = () => {
  const now = new Date();
  const data = [];
  for (let i = 9; i >= 0; i--) {
    const time = new Date(now.getTime() - Number(i) * 10000);
    data.push({
      time: time.toLocaleTimeString(),
      requests: Math.floor(Math.random() * 50) + 100,
      latency: Math.floor(Math.random() * 100) + 50,
      errors: Math.floor(Math.random() * 5),
    });
  }
  return data;
};

const systemStatus = [
  { name: "API Server", status: "operational", uptime: "99.9%", latency: 45 },
  { name: "Database", status: "operational", uptime: "99.8%", latency: 12 },
  { name: "OCR Service", status: "operational", uptime: "99.5%", latency: 234 },
  { name: "AI Engine", status: "operational", uptime: "99.7%", latency: 156 },
  { name: "Cache Layer", status: "operational", uptime: "100%", latency: 8 },
];

const realTimeMetrics = [
  {
    title: "Active Sessions",
    value: "247",
    change: "+12",
    icon: Activity,
    color: "text-blue-500",
  },
  {
    title: "Requests/min",
    value: "1,245",
    change: "+89",
    icon: Zap,
    color: "text-yellow-500",
  },
  {
    title: "Avg Latency",
    value: "45ms",
    change: "-5ms",
    icon: Clock,
    color: "text-green-500",
  },
  {
    title: "Error Rate",
    value: "0.12%",
    change: "-0.03%",
    icon: RefreshCw,
    color: "text-purple-500",
  },
  {
    title: "CPU Usage",
    value: "42%",
    change: "-8%",
    icon: Server,
    color: "text-orange-500",
  },
  {
    title: "Memory Usage",
    value: "68%",
    change: "+2%",
    icon: Database,
    color: "text-red-500",
  },
];

export function RealTimeMetrics() {
  const [realTimeData, setRealTimeData] = useState(generateRealTimeData());
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData((prev) => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString(),
          requests: Math.floor(Math.random() * 50) + 100,
          latency: Math.floor(Math.random() * 100) + 50,
          errors: Math.floor(Math.random() * 5),
        });
        return newData;
      });
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Live updates • Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
        <Globe className="h-5 w-5 text-primary" />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {realTimeMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-3 w-3 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Request Volume</CardTitle>
            <Activity className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Response Latency</CardTitle>
            <Clock className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemStatus.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Uptime: {service.uptime}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{service.status}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.latency}ms
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  OCR Timeout
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  2 minutes ago
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Database Query Slow
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  8 minutes ago
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  API Rate Limit
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  15 minutes ago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Error Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="errors"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
