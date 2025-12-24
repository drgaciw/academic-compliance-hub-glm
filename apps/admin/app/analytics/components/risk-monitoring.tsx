"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@aah/ui";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  Activity,
  MapPin,
  Bell,
} from "lucide-react";

const atRiskStudents = [
  {
    id: "STU-001",
    name: "John Smith",
    sport: "Football",
    department: "Business",
    gpa: 2.1,
    credits: 24,
    riskScore: 92,
    lastUpdate: "2 hours ago",
  },
  {
    id: "STU-002",
    name: "Sarah Johnson",
    sport: "Basketball",
    department: "Engineering",
    gpa: 2.3,
    credits: 18,
    riskScore: 88,
    lastUpdate: "4 hours ago",
  },
  {
    id: "STU-003",
    name: "Michael Brown",
    sport: "Track",
    department: "Arts",
    gpa: 2.4,
    credits: 30,
    riskScore: 85,
    lastUpdate: "1 day ago",
  },
  {
    id: "STU-004",
    name: "Emily Davis",
    sport: "Soccer",
    department: "Science",
    gpa: 2.5,
    credits: 21,
    riskScore: 82,
    lastUpdate: "5 hours ago",
  },
  {
    id: "STU-005",
    name: "David Wilson",
    sport: "Baseball",
    department: "Business",
    gpa: 2.6,
    credits: 27,
    riskScore: 78,
    lastUpdate: "3 hours ago",
  },
];

const riskByDepartment = [
  { name: "Engineering", high: 12, medium: 25, low: 63 },
  { name: "Business", high: 8, medium: 20, low: 72 },
  { name: "Science", high: 6, medium: 18, low: 76 },
  { name: "Arts", high: 5, medium: 15, low: 80 },
  { name: "Education", high: 3, medium: 10, low: 87 },
];

const riskBySport = [
  { name: "Football", riskScore: 72, students: 85 },
  { name: "Basketball", riskScore: 65, students: 65 },
  { name: "Baseball", riskScore: 58, students: 45 },
  { name: "Soccer", riskScore: 52, students: 55 },
  { name: "Track", riskScore: 48, students: 40 },
  { name: "Swimming", riskScore: 35, students: 30 },
];

const interventionEffectiveness = [
  { week: "Week 17", intervention: 45, success: 65 },
  { week: "Week 18", intervention: 52, success: 72 },
  { week: "Week 19", intervention: 58, success: 78 },
  { week: "Week 20", intervention: 64, success: 84 },
  { week: "Week 21", intervention: 70, success: 88 },
  { week: "Week 22", intervention: 78, success: 92 },
];

const heatMapData = [
  { name: "Football", Engineering: 85, Business: 75, Science: 70, Arts: 65 },
  { name: "Basketball", Engineering: 78, Business: 72, Science: 68, Arts: 62 },
  { name: "Baseball", Engineering: 65, Business: 60, Science: 58, Arts: 55 },
  { name: "Soccer", Engineering: 58, Business: 55, Science: 52, Arts: 48 },
  { name: "Track", Engineering: 52, Business: 48, Science: 45, Arts: 42 },
];

const earlyWarningData = [
  { name: "GPA Decline", current: 23, threshold: 15, trend: "up" },
  { name: "Credit Shortage", current: 18, threshold: 20, trend: "down" },
  { name: "Course Failures", current: 12, threshold: 10, trend: "up" },
  { name: "Attendance Issues", current: 28, threshold: 25, trend: "up" },
];

const riskMetrics = [
  {
    title: "At-Risk Students",
    value: "47",
    trend: "-12%",
    positive: true,
    icon: AlertTriangle,
  },
  {
    title: "Interventions Active",
    value: "78",
    trend: "+18%",
    positive: true,
    icon: Shield,
  },
  {
    title: "Success Rate",
    value: "92%",
    trend: "+27%",
    positive: true,
    icon: TrendingDown,
  },
  {
    title: "Avg Risk Score",
    value: "68",
    trend: "-8",
    positive: true,
    icon: Activity,
  },
];

export function RiskMonitoring() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {riskMetrics.map((metric) => (
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
                  {metric.trend}
                </span>{" "}
                from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">At-Risk Students</CardTitle>
            <Bell className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atRiskStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-red-50 dark:bg-red-950"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{student.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white">
                        {student.riskScore}% Risk
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {student.sport} • {student.department} • GPA:{" "}
                      {student.gpa}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {student.lastUpdate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Risk by Department</CardTitle>
            <MapPin className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={riskByDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="high"
                  stackId="a"
                  fill="#ef4444"
                  name="High Risk"
                />
                <Bar
                  dataKey="medium"
                  stackId="a"
                  fill="#f59e0b"
                  name="Medium Risk"
                />
                <Bar dataKey="low" stackId="a" fill="#10b981" name="Low Risk" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Score by Sport</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskBySport}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="riskScore" fill="#ef4444" name="Avg Risk Score" />
                <Bar dataKey="students" fill="#3b82f6" name="# Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intervention Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={interventionEffectiveness}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="intervention"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Interventions %"
                />
                <Line
                  type="monotone"
                  dataKey="success"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Success Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Early Warning Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earlyWarningData.map((indicator) => (
                <div key={indicator.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{indicator.name}</span>
                    <span
                      className={`text-sm ${
                        indicator.current > indicator.threshold
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {indicator.current} / {indicator.threshold}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className={`h-2.5 rounded-full ${
                        indicator.current > indicator.threshold
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min((indicator.current / indicator.threshold) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Heat Map: Sport vs Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 h-[300px]">
              {heatMapData.map((row) => (
                <div key={row.name} className="space-y-2">
                  <p className="text-xs font-medium text-center">{row.name}</p>
                  <div className="space-y-1">
                    {Object.entries(row)
                      .filter(([key]) => key !== "name")
                      .map(([dept, value]) => (
                        <div
                          key={dept}
                          className={`h-12 rounded flex items-center justify-center text-xs font-bold ${
                            Number(value) > 75
                              ? "bg-red-500 text-white"
                              : Number(value) > 60
                                ? "bg-yellow-500 text-white"
                                : "bg-green-500 text-white"
                          }`}
                        >
                          {value}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
