"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@aah/ui";
import { MetricsOverview } from "./components/metrics-overview";
import { PerformanceCharts } from "./components/performance-charts";
import { WhatIfAnalytics } from "./components/what-if-analytics";
import { RiskMonitoring } from "./components/risk-monitoring";
import { RealTimeMetrics } from "./components/real-time-metrics";
import {
  Activity,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Zap,
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Week 21-22 Performance & Risk Analysis
            </p>
          </div>
          <div className="flex gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-muted-foreground">
              Real-time Active
            </span>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="what-if" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              What-If
            </TabsTrigger>
            <TabsTrigger value="risk" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Monitor
            </TabsTrigger>
            <TabsTrigger value="realtime" className="gap-2">
              <Zap className="h-4 w-4" />
              Real-Time
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MetricsOverview />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceCharts />
          </TabsContent>

          <TabsContent value="what-if" className="space-y-6">
            <WhatIfAnalytics />
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <RiskMonitoring />
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <RealTimeMetrics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
