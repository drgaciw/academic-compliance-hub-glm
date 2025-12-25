"use client";

import { useState } from "react";
import {
  Search,
  Shield,
  FileText,
  Trash2,
  Download,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@aah/ui";
import { Input } from "@aah/ui";
import { Badge } from "@aah/ui";
import { DataTable } from "@aah/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aah/ui";
import { SelectSearch } from "@aah/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@aah/ui";
import { Label } from "@aah/ui";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "login"
  | "logout"
  | "export"
  | "import";

export interface AuditLog {
  id: string;
  action: AuditAction;
  actionType: string;
  userId: string;
  userName: string;
  userEmail: string;
  targetId: string;
  targetType: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

interface AuditLogTableProps {
  data?: AuditLog[];
  onExport?: () => void;
}

export function AuditLogTable({
  data = mockAuditLogs,
  onExport,
}: AuditLogTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [userFilter, setUserFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case "create":
      case "approve":
        return "bg-green-100 text-green-700";
      case "update":
      case "export":
        return "bg-blue-100 text-blue-700";
      case "delete":
      case "reject":
        return "bg-red-100 text-red-700";
      case "login":
      case "logout":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case "create":
      case "update":
      case "delete":
        return <FileText className="h-3 w-3" />;
      case "approve":
      case "reject":
        return <Shield className="h-3 w-3" />;
      case "export":
      case "import":
        return <Download className="h-3 w-3" />;
      default:
        return <Settings className="h-3 w-3" />;
    }
  };

  const filteredData = data.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    const matchesUser = !userFilter || log.userId === userFilter;

    return matchesSearch && matchesAction && matchesUser;
  });

  const uniqueUsers = Array.from(new Set(data.map((log) => log.userId))).map(
    (userId) => {
      const log = data.find((l) => l.userId === userId);
      return {
        id: userId,
        name: log?.userName || "",
        email: log?.userEmail || "",
      };
    },
  );

  const columns = [
    {
      accessorKey: "timestamp",
      header: "Date & Time",
      cell: ({ row }: { row: any }) => {
        const date = new Date(row.getValue("timestamp"));
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }: { row: any }) => {
        const action = row.getValue("action") as AuditAction;
        const actionType = row.getValue("actionType") as string;
        return (
          <Badge className={getActionColor(action)}>
            <span className="flex items-center gap-1">
              {getActionIcon(action)}
              {actionType}
            </span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }: { row: any }) => {
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{row.getValue("userName")}</div>
              <div className="text-xs text-muted-foreground">
                {row.getValue("userEmail")}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "targetType",
      header: "Target",
      cell: ({ row }: { row: any }) => {
        return (
          <div className="text-sm">
            <div className="font-medium">{row.getValue("targetType")}</div>
            <div className="text-xs text-muted-foreground">
              {row.getValue("targetId")}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }: { row: any }) => {
        const details = row.getValue("details") as string;
        return <div className="text-sm max-w-xs truncate">{details}</div>;
      },
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }: { row: any }) => {
        return (
          <span className="text-sm font-mono">{row.getValue("ipAddress")}</span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: { row: any }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedLog(row.original);
              setDetailsOpen(true);
            }}
          >
            View
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={actionFilter}
            onValueChange={(v) => setActionFilter(v as AuditAction | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Created</SelectItem>
              <SelectItem value="update">Updated</SelectItem>
              <SelectItem value="delete">Deleted</SelectItem>
              <SelectItem value="approve">Approved</SelectItem>
              <SelectItem value="reject">Rejected</SelectItem>
              <SelectItem value="export">Exported</SelectItem>
              <SelectItem value="import">Imported</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Users</SelectItem>
              {uniqueUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns as any}
        data={filteredData}
        pageSize={20}
        filterPlaceholder="Search logs..."
      />

      {selectedLog && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Audit Log Details</DialogTitle>
              <DialogDescription>
                Full details for this action
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Action</Label>
                  <div className="font-medium">{selectedLog.actionType}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Timestamp</Label>
                  <div className="font-medium">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <div className="font-medium">{selectedLog.userName}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedLog.userEmail}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Target</Label>
                  <div className="font-medium">{selectedLog.targetType}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedLog.targetId}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Details</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {selectedLog.details}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">IP Address</Label>
                  <div className="font-medium font-mono text-sm">
                    {selectedLog.ipAddress}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Log ID</Label>
                  <div className="font-medium font-mono text-sm">
                    {selectedLog.id}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    action: "create",
    actionType: "Transfer Request Created",
    userId: "user1",
    userName: "John Smith",
    userEmail: "john.smith@university.edu",
    targetId: "req-001",
    targetType: "Transfer Request",
    details: "Created new transfer request for MATH 101 to MATH 201",
    timestamp: "2024-01-20T10:30:00Z",
    ipAddress: "192.168.1.100",
  },
  {
    id: "2",
    action: "approve",
    actionType: "Request Approved",
    userId: "user2",
    userName: "Sarah Johnson",
    userEmail: "sarah.j@university.edu",
    targetId: "req-001",
    targetType: "Transfer Request",
    details: "Approved transfer request req-001 with 4 credits",
    timestamp: "2024-01-20T14:15:00Z",
    ipAddress: "192.168.1.101",
  },
  {
    id: "3",
    action: "export",
    actionType: "Report Exported",
    userId: "user1",
    userName: "John Smith",
    userEmail: "john.smith@university.edu",
    targetId: "report-001",
    targetType: "Report",
    details: "Exported monthly transfer credits report as PDF",
    timestamp: "2024-01-21T09:00:00Z",
    ipAddress: "192.168.1.100",
  },
  {
    id: "4",
    action: "delete",
    actionType: "Request Deleted",
    userId: "user3",
    userName: "Michael Brown",
    userEmail: "m.brown@university.edu",
    targetId: "req-002",
    targetType: "Transfer Request",
    details: "Deleted transfer request req-002 - duplicate entry",
    timestamp: "2024-01-21T11:30:00Z",
    ipAddress: "192.168.1.102",
  },
  {
    id: "5",
    action: "login",
    actionType: "User Login",
    userId: "user2",
    userName: "Sarah Johnson",
    userEmail: "sarah.j@university.edu",
    targetId: "user2",
    targetType: "User Session",
    details: "Successful login from university network",
    timestamp: "2024-01-22T08:45:00Z",
    ipAddress: "192.168.1.101",
  },
  {
    id: "6",
    action: "update",
    actionType: "Request Updated",
    userId: "user1",
    userName: "John Smith",
    userEmail: "john.smith@university.edu",
    targetId: "req-003",
    targetType: "Transfer Request",
    details: "Updated target course from MATH 201 to MATH 301",
    timestamp: "2024-01-22T10:20:00Z",
    ipAddress: "192.168.1.100",
  },
  {
    id: "7",
    action: "reject",
    actionType: "Request Rejected",
    userId: "user4",
    userName: "Emily Davis",
    userEmail: "emily.d@university.edu",
    targetId: "req-004",
    targetType: "Transfer Request",
    details: "Rejected request - insufficient course equivalency",
    timestamp: "2024-01-23T13:45:00Z",
    ipAddress: "192.168.1.103",
  },
  {
    id: "8",
    action: "import",
    actionType: "Data Imported",
    userId: "user5",
    userName: "James Wilson",
    userEmail: "j.wilson@university.edu",
    targetId: "import-001",
    targetType: "Batch Import",
    details: "Imported 50 transfer requests from CSV file",
    timestamp: "2024-01-24T15:30:00Z",
    ipAddress: "192.168.1.104",
  },
];
