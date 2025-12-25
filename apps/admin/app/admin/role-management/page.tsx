"use client";

import { useState } from "react";
import { LayoutDashboard, Users, Menu, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aah/ui";
import { RoleAssignment } from "../../components/admin/role-assignment";
import { UserCreationForm } from "../../components/admin/user-creation-form";
import { UserDeactivation } from "../../components/admin/user-deactivation";
import { ImpersonationFeature } from "../../components/admin/impersonation-feature";
import { Dialog, DialogContent, DialogTrigger } from "@aah/ui";
import { DataTable } from "@aah/ui";
import { Badge } from "@aah/ui";
import { Button } from "@aah/ui";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string;
}

export default function RoleManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deactivationTarget, setDeactivationTarget] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [impersonatingUser, setImpersonatingUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const availableRoles = [
    {
      id: "admin",
      name: "Admin",
      description: "Full system access",
      permissions: ["All permissions"],
    },
    {
      id: "compliance-officer",
      name: "Compliance Officer",
      description: "Manage compliance rules",
      permissions: ["View compliance", "Edit rules", "Run reports"],
    },
    {
      id: "reviewer",
      name: "Reviewer",
      description: "Review eligibility",
      permissions: ["View cases", "Add notes"],
    },
  ];

  const availableDepartments = [
    { id: "athletics", name: "Athletics" },
    { id: "compliance", name: "Compliance" },
    { id: "academic-affairs", name: "Academic Affairs" },
  ];

  const users: User[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@university.edu",
      role: "admin",
      status: "Active",
      department: "Athletics",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@university.edu",
      role: "compliance-officer",
      status: "Active",
      department: "Compliance",
    },
    {
      id: "3",
      name: "Michael Williams",
      email: "michael.williams@university.edu",
      role: "reviewer",
      status: "Active",
      department: "Academic Affairs",
    },
  ];

  const columns = [
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
      cell: (info: any) => {
        const role = availableRoles.find((r) => r.id === info.getValue());
        return role ? role.name : info.getValue();
      },
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: any) => {
        const status = info.getValue() as string;
        const variant = status === "Active" ? "default" : "outline";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info: any) => {
        const user = info.row.original as User;
        return (
          <div className="flex gap-2">
            <ImpersonationFeature
              targetUserId={user.id}
              targetUserName={user.name}
              onImpersonate={(userId) =>
                setImpersonatingUser({ id: userId, name: user.name })
              }
              onStopImpersonation={() => setImpersonatingUser(null)}
              isImpersonating={impersonatingUser?.id === user.id}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setDeactivationTarget({
                  id: user.id,
                  name: user.name,
                  email: user.email,
                })
              }
            >
              Deactivate
            </Button>
          </div>
        );
      },
    },
  ];

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    {
      href: "/admin/admin/role-management",
      label: "Role Management",
      icon: Users,
    },
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
              Role Management
            </h2>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 space-y-6">
          {impersonatingUser && (
            <div className="mb-4">
              <ImpersonationFeature
                targetUserId={impersonatingUser.id}
                targetUserName={impersonatingUser.name}
                onImpersonate={() => {}}
                onStopImpersonation={() => setImpersonatingUser(null)}
                isImpersonating={true}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Assignment</CardTitle>
                <CardDescription>
                  Assign roles to users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoleAssignment
                  userId="1"
                  userName="John Smith"
                  currentRole="admin"
                  availableRoles={availableRoles}
                  onRoleChange={(userId, roleId) =>
                    console.log("Role changed:", userId, roleId)
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create User</CardTitle>
                <CardDescription>Add a new user to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <UserCreationForm
                  availableRoles={availableRoles}
                  availableDepartments={availableDepartments}
                  onSubmit={(data) => {
                    console.log("Creating user:", data);
                    setShowCreateForm(false);
                  }}
                  onCancel={() => setShowCreateForm(false)}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage user accounts and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={users}
                pageSize={10}
                filterPlaceholder="Search users..."
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <UserDeactivation
        open={!!deactivationTarget}
        onClose={() => setDeactivationTarget(null)}
        onConfirm={() => {
          console.log("Deactivating user:", deactivationTarget);
          setDeactivationTarget(null);
        }}
        userName={deactivationTarget?.name || ""}
        userEmail={deactivationTarget?.email || ""}
      />
    </div>
  );
}
