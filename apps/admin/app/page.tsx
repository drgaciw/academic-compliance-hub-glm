"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Users,
  BarChart,
  Calendar,
  Clock,
  FileCheck,
  AlertTriangle,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aah/ui";
import { Button } from "@aah/ui";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DateRangePicker, DateRange } from "../components/date-range-picker";

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend: string;
  trendUp: boolean;
}

const statCards: StatCard[] = [
  {
    title: "Pending Requests",
    value: "23",
    description: "Transfer requests awaiting review",
    icon: Clock,
    trend: "+3 from yesterday",
    trendUp: true,
  },
  {
    title: "Completed Today",
    value: "12",
    description: "Evaluations finished",
    icon: FileCheck,
    trend: "+5 from yesterday",
    trendUp: true,
  },
  {
    title: "At-Risk Students",
    value: "8",
    description: "Immediate attention needed",
    icon: AlertTriangle,
    trend: "-2 from last week",
    trendUp: true,
  },
  {
    title: "Total Students",
    value: "1,247",
    description: "Active students",
    icon: Users,
    trend: "+15 this month",
    trendUp: true,
  },
];

const complianceData = [
  { name: "Fully Compliant", value: 856, percentage: 69 },
  { name: "Partially Compliant", value: 287, percentage: 23 },
  { name: "Non-Compliant", value: 104, percentage: 8 },
];

const transferRequestsData = [
  { name: "Jan", approved: 45, pending: 12, rejected: 3 },
  { name: "Feb", approved: 52, pending: 15, rejected: 5 },
  { name: "Mar", approved: 38, pending: 10, rejected: 2 },
  { name: "Apr", approved: 48, pending: 18, rejected: 4 },
  { name: "May", approved: 55, pending: 23, rejected: 6 },
];

const COLORS = ["#22c55e", "#eab308", "#ef4444"];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/transcripts", label: "Transcripts", icon: FileText },
    { href: "/admin/upload", label: "Upload", icon: Upload },
    { href: "/admin/compliance", label: "Compliance", icon: BarChart },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:translate-x-0 lg:static lg:z-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between border-b px-6 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Admin Hub
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4" aria-label="Sidebar navigation">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="flex flex-1 flex-col lg:ml-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Dashboard
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground lg:flex">
                <Users className="h-5 w-5" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, Admin User
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  Here's an overview of your admin activities.
                </p>
              </div>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                label="Date Range"
                className="w-72"
              />
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card
                key={stat.title}
                className="border border-gray-200 dark:border-gray-700"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {stat.title}
                  </CardTitle>
                  <stat.icon
                    className="h-4 w-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </p>
                  <div className="mt-2 flex items-center text-xs">
                    <span
                      className={`flex items-center gap-1 ${
                        stat.trendUp
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {stat.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>
                  Student compliance status distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => {
                        const total = complianceData.reduce(
                          (acc: number, curr: { value: number }) =>
                            acc + curr.value,
                          0,
                        );
                        const percentage = Math.round(
                          (props.value / total) * 100,
                        );
                        return `${props.name}: ${percentage}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {complianceData.map((_, index) => (
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

            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Transfer Requests</CardTitle>
                <CardDescription>Monthly request status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={transferRequestsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approved" fill="#22c55e" name="Approved" />
                    <Bar dataKey="pending" fill="#eab308" name="Pending" />
                    <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Transfer Requests</CardTitle>
                  <CardDescription>
                    {statCards[0].value} requests requiring immediate attention
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="/admin/compliance"
                    className="flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-sm text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Calendar className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                  <p>Pending requests will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
