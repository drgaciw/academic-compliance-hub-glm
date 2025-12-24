"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@aah/ui";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle,
} from "lucide-react";

const scenarios = [
  {
    id: 1,
    name: "Current Baseline",
    description: "No changes to current process",
    transferRate: 88,
    processingTime: 1.4,
    officerHours: 40,
    cost: 50000,
    satisfaction: 85,
  },
  {
    id: 2,
    name: "AI Enhancement",
    description: "Add AI-powered document analysis",
    transferRate: 92,
    processingTime: 0.8,
    officerHours: 30,
    cost: 75000,
    satisfaction: 90,
  },
  {
    id: 3,
    name: "Staff Expansion",
    description: "Hire 2 additional compliance officers",
    transferRate: 90,
    processingTime: 1.2,
    officerHours: 45,
    cost: 120000,
    satisfaction: 88,
  },
  {
    id: 4,
    name: "Process Optimization",
    description: "Streamline workflow with automation",
    transferRate: 91,
    processingTime: 1.0,
    officerHours: 35,
    cost: 40000,
    satisfaction: 87,
  },
  {
    id: 5,
    name: "Hybrid Approach",
    description: "Combine AI + Process Optimization",
    transferRate: 95,
    processingTime: 0.7,
    officerHours: 25,
    cost: 90000,
    satisfaction: 94,
  },
];

const radarData = [
  { metric: "Transfer Rate", current: 88, ai: 92, hybrid: 95 },
  { metric: "Efficiency", current: 72, ai: 88, hybrid: 95 },
  { metric: "Satisfaction", current: 85, ai: 90, hybrid: 94 },
  { metric: "Cost Effectiveness", current: 90, ai: 75, hybrid: 80 },
  { metric: "Scalability", current: 70, ai: 90, hybrid: 95 },
];

const impactData = scenarios.map((scenario) => ({
  name: scenario.name,
  impact: ((scenario.transferRate - 88) / 88) * 100,
  cost: scenario.cost,
}));

const recommendations = [
  {
    rank: 1,
    scenario: "Hybrid Approach",
    reason: "Best overall performance with reasonable cost",
    impact: "+7% transfer rate",
    priority: "High",
  },
  {
    rank: 2,
    scenario: "Process Optimization",
    reason: "Quick wins with minimal investment",
    impact: "+3% transfer rate",
    priority: "Medium",
  },
  {
    rank: 3,
    scenario: "AI Enhancement",
    reason: "Significant efficiency gains",
    impact: "+4% transfer rate",
    priority: "Medium",
  },
  {
    rank: 4,
    scenario: "Staff Expansion",
    reason: "Most expensive option",
    impact: "+2% transfer rate",
    priority: "Low",
  },
];

export function WhatIfAnalytics() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);

  const rankedScenarios = [...scenarios].sort(
    (a, b) => b.transferRate - a.transferRate,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        {rankedScenarios.map((scenario, index) => (
          <Card
            key={scenario.id}
            className={`cursor-pointer transition-all ${
              selectedScenario.id === scenario.id
                ? "ring-2 ring-primary"
                : "hover:shadow-md"
            }`}
            onClick={() => setSelectedScenario(scenario)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium">
                  #{index + 1} {scenario.name}
                </CardTitle>
                {index === 0 && (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-lg font-bold">{scenario.transferRate}%</div>
              <p className="text-xs text-muted-foreground">Transfer Rate</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Selected Scenario</CardTitle>
            <Brain className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">{selectedScenario.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedScenario.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Transfer Rate</p>
                <p className="text-2xl font-bold text-green-500">
                  {selectedScenario.transferRate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing Time</p>
                <p className="text-2xl font-bold text-blue-500">
                  {selectedScenario.processingTime}s
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Officer Hours</p>
                <p className="text-2xl font-bold text-purple-500">
                  {selectedScenario.officerHours}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost</p>
                <p className="text-2xl font-bold text-orange-500">
                  ${selectedScenario.cost.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Scenario Comparison</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="AI"
                  dataKey="ai"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Hybrid"
                  dataKey="hybrid"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Impact Analysis</CardTitle>
            <Lightbulb className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="impact" fill="#3b82f6" name="Impact %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recommendations</CardTitle>
            <CheckCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.rank}
                  className={`p-4 rounded-lg border ${
                    rec.priority === "High"
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : rec.priority === "Medium"
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                        : "border-gray-500 bg-gray-50 dark:bg-gray-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold">
                        {rec.rank}
                      </div>
                      <span className="font-semibold">{rec.scenario}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === "High"
                          ? "bg-green-500 text-white"
                          : rec.priority === "Medium"
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-500 text-white"
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {rec.reason}
                  </p>
                  <p className="text-sm font-semibold mt-1 text-primary">
                    {rec.impact}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
