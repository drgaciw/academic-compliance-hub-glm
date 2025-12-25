"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Users,
  BarChart,
  Menu,
  X,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aah/ui";
import { Button } from "@aah/ui";
import { DataTable } from "@aah/ui";
import { Badge } from "@aah/ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@aah/ui";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Compliance Officer" | "Reviewer";
  status: "Active" | "Inactive" | "Pending";
  department: string;
  lastLogin: string;
}

const users: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@university.edu",
    role: "Admin",
    status: "Active",
    department: "Athletics",
    lastLogin: "2024-12-24 09:30",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@university.edu",
    role: "Compliance Officer",
    status: "Active",
    department: "Compliance",
    lastLogin: "2024-12-24 14:20",
  },
  {
    id: "3",
    name: "Michael Williams",
    email: "michael.williams@university.edu",
    role: "Reviewer",
    status: "Active",
    department: "Academic Affairs",
    lastLogin: "2024-12-23 11:45",
  },
  {
    id: "4",
    name: "Emily Brown",
    email: "emily.brown@university.edu",
    role: "Compliance Officer",
    status: "Active",
    department: "Compliance",
    lastLogin: "2024-12-24 08:15",
  },
  {
    id: "5",
    name: "David Davis",
    email: "david.davis@university.edu",
    role: "Reviewer",
    status: "Pending",
    department: "Athletics",
    lastLogin: "Never",
  },
  {
    id: "6",
    name: "Jennifer Wilson",
    email: "jennifer.wilson@university.edu",
    role: "Admin",
    status: "Inactive",
    department: "Athletics",
    lastLogin: "2024-12-10 16:30",
  },
  {
    id: "7",
    name: "Robert Taylor",
    email: "robert.taylor@university.edu",
    role: "Compliance Officer",
    status: "Active",
    department: "Compliance",
    lastLogin: "2024-12-24 10:00",
  },
  {
    id: "8",
    name: "Lisa Anderson",
    email: "lisa.anderson@university.edu",
    role: "Reviewer",
    status: "Active",
    department: "Academic Affairs",
    lastLogin: "2024-12-23 15:45",
  },
];

const columns: any[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info: any) => (
      <span className="font-medium">{info.getValue() as string}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info: any) => {
      const status = info.getValue() as User["status"];
      const variant =
        status === "Active"
          ? "default"
          : status === "Inactive"
            ? "secondary"
            : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <Button variant="ghost" size="sm">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    ),
  },
];

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
              Users
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              Manage users, roles, and permissions.
            </p>
          </div>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    {users.length} users in system
                  </CardDescription>
                </div>
                <Button>Add User</Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={users}
                pageSize={10}
                filterPlaceholder="Search users..."
                showColumnToggle
                onRowSelectionChange={(selection) => {
                  const selectedId = Object.keys(selection)[0];
                  if (selectedId) {
                    const user = users.find((u) => u.id === selectedId);
                    if (user) setSelectedUser(user);
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {selectedUser && (
        <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>User Details</SheetTitle>
              <SheetDescription>
                View and manage user information
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedUser.role}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Department
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedUser.department}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <p className="mt-1">
                    <Badge
                      variant={
                        selectedUser.status === "Active"
                          ? "default"
                          : selectedUser.status === "Inactive"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {selectedUser.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Login
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedUser.lastLogin}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t dark:border-gray-700">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Edit User
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    Delete User
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
