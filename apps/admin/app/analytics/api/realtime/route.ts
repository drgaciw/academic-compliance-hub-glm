import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const realTimeData = [];
  for (let i = 9; i >= 0; i--) {
    const time = new Date(now.getTime() - Number(i) * 10000);
    realTimeData.push({
      time: time.toLocaleTimeString(),
      requests: Math.floor(Math.random() * 50) + 100,
      latency: Math.floor(Math.random() * 100) + 50,
      errors: Math.floor(Math.random() * 5),
    });
  }

  const systemStatus = [
    { name: "API Server", status: "operational", uptime: "99.9%", latency: 45 },
    { name: "Database", status: "operational", uptime: "99.8%", latency: 12 },
    {
      name: "OCR Service",
      status: "operational",
      uptime: "99.5%",
      latency: 234,
    },
    { name: "AI Engine", status: "operational", uptime: "99.7%", latency: 156 },
    { name: "Cache Layer", status: "operational", uptime: "100%", latency: 8 },
  ];

  const realTimeMetrics = [
    {
      title: "Active Sessions",
      value: "247",
      change: "+12",
      color: "text-blue-500",
    },
    {
      title: "Requests/min",
      value: "1,245",
      change: "+89",
      color: "text-yellow-500",
    },
    {
      title: "Avg Latency",
      value: "45ms",
      change: "-5ms",
      color: "text-green-500",
    },
    {
      title: "Error Rate",
      value: "0.12%",
      change: "-0.03%",
      color: "text-purple-500",
    },
    {
      title: "CPU Usage",
      value: "42%",
      change: "-8%",
      color: "text-orange-500",
    },
    {
      title: "Memory Usage",
      value: "68%",
      change: "+2%",
      color: "text-red-500",
    },
  ];

  const recentErrors = [
    {
      type: "OCR Timeout",
      message: "Document processing exceeded timeout limit",
      time: "2 minutes ago",
      severity: "error",
    },
    {
      type: "Database Query Slow",
      message: "Query took 5.2 seconds to complete",
      time: "8 minutes ago",
      severity: "warning",
    },
    {
      type: "API Rate Limit",
      message: "Exceeded rate limit for /api/compliance",
      time: "15 minutes ago",
      severity: "warning",
    },
  ];

  return NextResponse.json({
    realTimeData,
    systemStatus,
    realTimeMetrics,
    recentErrors,
    timestamp: new Date().toISOString(),
  });
}
