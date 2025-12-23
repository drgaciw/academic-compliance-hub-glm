"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Upload,
  FileCheck,
  Link2,
  BarChart3,
  ClipboardList,
  Menu,
  X,
  Users,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aah/ui";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend: string;
  trendUp: boolean;
}

interface ActivityItem {
  id: string;
  studentName: string;
  action: string;
  timestamp: string;
  status: "pending" | "completed" | "at-risk";
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/compliance/dashboard", icon: LayoutDashboard },
  { label: "Transcript Upload", href: "/compliance/upload", icon: Upload },
  { label: "Eligibility Review", href: "/compliance/review", icon: FileCheck },
  { label: "Course Mapping", href: "/compliance/mapping", icon: Link2 },
  { label: "Reports", href: "/compliance/reports", icon: BarChart3 },
  {
    label: "Audit Trail",
    href: "/compliance/audit-trail",
    icon: ClipboardList,
  },
];

const statCards: StatCard[] = [
  {
    title: "Pending Evaluations",
    value: "23",
    description: "Requires review",
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
];

const recentActivities: ActivityItem[] = [
  {
    id: "1",
    studentName: "Johnson, Marcus",
    action: "Transcript uploaded",
    timestamp: "2 minutes ago",
    status: "pending",
  },
  {
    id: "2",
    studentName: "Williams, Sarah",
    action: "Eligibility completed",
    timestamp: "15 minutes ago",
    status: "completed",
  },
  {
    id: "3",
    studentName: "Brown, James",
    action: "Course mapping updated",
    timestamp: "1 hour ago",
    status: "completed",
  },
  {
    id: "4",
    studentName: "Davis, Emily",
    action: "Transcript flagged",
    timestamp: "2 hours ago",
    status: "at-risk",
  },
  {
    id: "5",
    studentName: "Miller, Michael",
    action: "Transcript uploaded",
    timestamp: "3 hours ago",
    status: "pending",
  },
  {
    id: "6",
    studentName: "Wilson, Jennifer",
    action: "Eligibility completed",
    timestamp: "4 hours ago",
    status: "completed",
  },
  {
    id: "7",
    studentName: "Taylor, David",
    action: "Course mapping updated",
    timestamp: "5 hours ago",
    status: "completed",
  },
  {
    id: "8",
    studentName: "Anderson, Lisa",
    action: "Transcript flagged",
    timestamp: "6 hours ago",
    status: "at-risk",
  },
  {
    id: "9",
    studentName: "Thomas, Robert",
    action: "Transcript uploaded",
    timestamp: "7 hours ago",
    status: "pending",
  },
  {
    id: "10",
    studentName: "Garcia, Maria",
    action: "Eligibility completed",
    timestamp: "8 hours ago",
    status: "completed",
  },
];

export default function ComplianceDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("/compliance/dashboard");

  const getStatusBadgeClass = (status: ActivityItem["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "at-risk":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

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
            Compliance Hub
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
                  onClick={() => setActiveNav(item.href)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    activeNav === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
                  aria-current={activeNav === item.href ? "page" : undefined}
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
                  Officer Smith
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Compliance Officer
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, Officer Smith
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              Here's an overview of today's compliance activities.
            </p>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Last 10 evaluations and compliance actions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="/compliance/audit-trail"
                    className="flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th
                        scope="col"
                        className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white"
                      >
                        Student
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white"
                      >
                        Action
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white"
                      >
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity) => (
                      <tr
                        key={activity.id}
                        className="border-b last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {activity.studentName}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {activity.action}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(activity.status)}`}
                          >
                            {activity.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {activity.timestamp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
