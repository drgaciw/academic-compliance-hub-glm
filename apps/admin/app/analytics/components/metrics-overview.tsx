"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@aah/ui";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingDown,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const performanceData = [
  { name: "Week 17", ocr: 94, processing: 2.3, productivity: 85, success: 78 },
  { name: "Week 18", ocr: 95, processing: 2.1, productivity: 88, success: 81 },
  { name: "Week 19", ocr: 96, processing: 1.9, productivity: 90, success: 84 },
  { name: "Week 20", ocr: 97, processing: 1.7, productivity: 92, success: 86 },
  {
    name: "Week 21",
    ocr: 97.5,
    processing: 1.5,
    productivity: 94,
    success: 88,
  },
  { name: "Week 22", ocr: 98, processing: 1.4, productivity: 96, success: 91 },
];

const errorData = [
  { name: "OCR Errors", value: 12, color: "#ef4444" },
  { name: "Data Mapping", value: 8, color: "#f59e0b" },
  { name: "Validation", value: 5, color: "#3b82f6" },
  { name: "Compliance", value: 3, color: "#10b981" },
];

const metrics = [
  {
    title: "OCR Accuracy",
    value: "98.0%",
    change: "+2.5%",
    positive: true,
    icon: FileText,
  },
  {
    title: "Processing Time",
    value: "1.4s",
    change: "-0.3s",
    positive: true,
    icon: TrendingDown,
  },
  {
    title: "Officer Productivity",
    value: "96%",
    change: "+6%",
    positive: true,
    icon: Users,
  },
  {
    title: "Student Success",
    value: "91%",
    change: "+5%",
    positive: true,
    icon: CheckCircle,
  },
  {
    title: "Error Rate",
    value: "2.8%",
    change: "-1.2%",
    positive: true,
    icon: AlertCircle,
  },
];

export function MetricsOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    metric.positive ? "text-green-500" : "text-red-500"
                  }
                >
                  {metric.change}
                </span>{" "}
                from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends (Week 17-22)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ocr"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="OCR Accuracy %"
                />
                <Line
                  type="monotone"
                  dataKey="productivity"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Productivity %"
                />
                <Line
                  type="monotone"
                  dataKey="success"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Success %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={errorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {errorData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Processing Time Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="processing"
                fill="#3b82f6"
                name="Processing Time (s)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
