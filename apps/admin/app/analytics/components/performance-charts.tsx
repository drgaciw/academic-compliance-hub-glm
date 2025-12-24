"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@aah/ui";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { Clock, Target, Zap, Award } from "lucide-react";

const systemPerformance = [
  { name: "Week 17", ocr: 94, processing: 2.3, accuracy: 88 },
  { name: "Week 18", ocr: 95, processing: 2.1, accuracy: 90 },
  { name: "Week 19", ocr: 96, processing: 1.9, accuracy: 92 },
  { name: "Week 20", ocr: 97, processing: 1.7, accuracy: 94 },
  { name: "Week 21", ocr: 97.5, processing: 1.5, accuracy: 95 },
  { name: "Week 22", ocr: 98, processing: 1.4, accuracy: 97 },
];

const officerProductivity = [
  { name: "Officer A", cases: 45, hours: 35, efficiency: 1.29 },
  { name: "Officer B", cases: 52, hours: 40, efficiency: 1.3 },
  { name: "Officer C", cases: 38, hours: 30, efficiency: 1.27 },
  { name: "Officer D", cases: 48, hours: 38, efficiency: 1.26 },
  { name: "Officer E", cases: 55, hours: 42, efficiency: 1.31 },
];

const studentSuccess = [
  { name: "Fall 2023", transfer: 78, gpa: 2.7, completion: 82 },
  { name: "Spring 2024", transfer: 81, gpa: 2.8, completion: 85 },
  { name: "Fall 2024", transfer: 84, gpa: 2.9, completion: 88 },
  { name: "Spring 2025", transfer: 88, gpa: 3.0, completion: 91 },
];

const correlationData = [
  { x: 78, y: 2.7, z: 45 },
  { x: 81, y: 2.8, z: 52 },
  { x: 84, y: 2.9, z: 48 },
  { x: 88, y: 3.0, z: 55 },
  { x: 91, y: 3.1, z: 60 },
  { x: 75, y: 2.6, z: 40 },
  { x: 82, y: 2.85, z: 50 },
  { x: 86, y: 2.95, z: 58 },
];

const performanceMetrics = [
  {
    title: "Avg Processing Time",
    value: "1.4s",
    icon: Clock,
    trend: "-39% from Week 17",
  },
  {
    title: "Target Accuracy",
    value: "97%",
    icon: Target,
    trend: "+9% improvement",
  },
  {
    title: "Throughput",
    value: "245/hr",
    icon: Zap,
    trend: "+18% capacity",
  },
  {
    title: "Quality Score",
    value: "96%",
    icon: Award,
    trend: "+8% quality",
  },
];

export function PerformanceCharts() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Performance (Week 17-22)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={systemPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="ocr"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  name="OCR Accuracy %"
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  name="Overall Accuracy %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Officer Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={officerProductivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cases" fill="#3b82f6" name="Cases Handled" />
                <Bar dataKey="hours" fill="#10b981" name="Hours Worked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Success Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studentSuccess}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="transfer"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Transfer Rate %"
                />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Avg GPA"
                />
                <Line
                  type="monotone"
                  dataKey="completion"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Completion %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GPA vs Transfer Rate Correlation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name="Transfer Rate" unit="%" />
                <YAxis dataKey="y" name="GPA" />
                <ZAxis dataKey="z" range={[100, 500]} name="Cases" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter
                  name="Students"
                  fill="#3b82f6"
                  data={correlationData}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
