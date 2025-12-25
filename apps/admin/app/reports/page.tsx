"use client";

import { useState } from "react";
import { FileText, BarChart, Users, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aah/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aah/ui";
import { Button } from "@aah/ui";
import {
  ColumnSelector,
  ReportPreview,
  ReportExport,
  ScheduleReportConfig,
  BulkActionDropdown,
  BatchStatusUpdate,
  AuditLogTable,
  ReportFilters,
  UserFilter,
  ActionTypeFilter,
  type Column,
  type ScheduledReport,
  type BulkAction,
} from "../components/reports";
import { DataTable } from "@aah/ui";

export default function ReportsAndOperationsPage() {
  const [columns, setColumns] = useState<Column[]>([
    { id: "studentName", label: "Student Name", visible: true },
    { id: "studentId", label: "Student ID", visible: true },
    { id: "course", label: "Course", visible: true },
    { id: "credits", label: "Credits", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "submittedDate", label: "Submitted Date", visible: true },
    { id: "reviewedBy", label: "Reviewed By", visible: false },
  ]);

  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [batchUpdateOpen, setBatchUpdateOpen] = useState(false);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(
    [],
  );

  const mockData = [
    {
      id: "1",
      studentName: "John Smith",
      studentId: "STU001",
      course: "MATH 101",
      credits: 4,
      status: "Approved",
      submittedDate: "2024-01-15",
    },
    {
      id: "2",
      studentName: "Sarah Johnson",
      studentId: "STU002",
      course: "ENGL 101",
      credits: 3,
      status: "Pending",
      submittedDate: "2024-01-16",
    },
    {
      id: "3",
      studentName: "Michael Brown",
      studentId: "STU003",
      course: "PHYS 101",
      credits: 4,
      status: "Review Required",
      submittedDate: "2024-01-17",
    },
    {
      id: "4",
      studentName: "Emily Davis",
      studentId: "STU004",
      course: "CHEM 101",
      credits: 4,
      status: "Approved",
      submittedDate: "2024-01-18",
    },
    {
      id: "5",
      studentName: "James Wilson",
      studentId: "STU005",
      course: "BIOL 101",
      credits: 4,
      status: "Rejected",
      submittedDate: "2024-01-19",
    },
  ];

  const selectedCount = Object.keys(selectedRows).filter(
    (key) => selectedRows[key],
  ).length;
  const selectedIds = Object.keys(selectedRows).filter(
    (key) => selectedRows[key],
  );

  const handleBulkAction = async (action: BulkAction, ids: string[]) => {
    setBatchUpdateOpen(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`Bulk action ${action} executed on:`, ids);
  };

  const mockUsers = [
    { id: "user1", name: "John Smith", email: "john.smith@university.edu" },
    { id: "user2", name: "Sarah Johnson", email: "sarah.j@university.edu" },
    { id: "user3", name: "Michael Brown", email: "m.brown@university.edu" },
    { id: "user4", name: "Emily Davis", email: "emily.d@university.edu" },
    { id: "user5", name: "James Wilson", email: "j.wilson@university.edu" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Reports & Operations
        </h1>
        <p className="text-muted-foreground">
          Manage reports, exports, bulk actions, and audit logs
        </p>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="exports" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Exports
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Actions
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Management</CardTitle>
              <CardDescription>
                Preview reports, configure columns, and schedule automated
                reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Transfer Credits Report
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive view of all transfer credit requests
                  </p>
                </div>
                <div className="flex gap-2">
                  <ColumnSelector
                    columns={columns}
                    onColumnsChange={setColumns}
                  />
                  <ReportPreview
                    title="Transfer Credits Report"
                    description="Preview all transfer credit requests with detailed information"
                  />
                  <ReportExport
                    data={mockData}
                    filename="transfer-credits-report"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">
                  Selected Columns ({columns.filter((c) => c.visible).length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {columns
                    .filter((col) => col.visible)
                    .map((col) => (
                      <span
                        key={col.id}
                        className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded"
                      >
                        {col.label}
                      </span>
                    ))}
                </div>
              </div>

              <DataTable
                columns={
                  columns
                    .filter((col) => col.visible)
                    .map((col) => ({
                      accessorKey: col.id,
                      header: col.label,
                    })) as any
                }
                data={mockData}
                pageSize={10}
                onRowSelectionChange={setSelectedRows}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Configure automated report generation and delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduleReportConfig
                existingReports={scheduledReports}
                onSave={(report) =>
                  setScheduledReports([...scheduledReports, report])
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                Export data in various formats (PDF, CSV, Excel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Quick Export</h4>
                  <div className="flex gap-2">
                    <ReportExport
                      data={mockData}
                      filename="quick-export"
                      trigger={<Button>Export as PDF</Button>}
                    />
                    <ReportExport
                      data={mockData}
                      filename="quick-export"
                      trigger={<Button variant="outline">Export as CSV</Button>}
                    />
                    <ReportExport
                      data={mockData}
                      filename="quick-export"
                      trigger={
                        <Button variant="outline">Export as Excel</Button>
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">
                    Export Statistics
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {mockData.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Records
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-sm text-muted-foreground">
                        Formats Available
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">Unlimited</div>
                      <div className="text-sm text-muted-foreground">
                        Record Limit
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>
                Perform batch actions on multiple records simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Transfer Requests</h3>
                  <p className="text-sm text-muted-foreground">
                    Select records to perform bulk actions
                  </p>
                </div>
                <BulkActionDropdown
                  selectedCount={selectedCount}
                  onAction={handleBulkAction}
                  selectedIds={selectedIds}
                />
              </div>

              <DataTable
                columns={
                  [
                    { accessorKey: "studentName", header: "Student Name" },
                    { accessorKey: "studentId", header: "Student ID" },
                    { accessorKey: "course", header: "Course" },
                    { accessorKey: "credits", header: "Credits" },
                    { accessorKey: "status", header: "Status" },
                    { accessorKey: "submittedDate", header: "Submitted Date" },
                  ] as any
                }
                data={mockData}
                pageSize={10}
                onRowSelectionChange={setSelectedRows}
              />

              {batchUpdateOpen && selectedCount > 0 && (
                <div className="mt-4">
                  <BatchStatusUpdate
                    selectedIds={selectedIds}
                    total={selectedCount}
                    onComplete={() => setBatchUpdateOpen(false)}
                    onCancel={() => setBatchUpdateOpen(false)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Track all system actions and changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReportFilters
                onFiltersChange={(filters) =>
                  console.log("Filters changed:", filters)
                }
              />

              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Filter by User:
                    </label>
                    <div className="mt-1">
                      <UserFilter
                        users={mockUsers}
                        selectedUsers={[]}
                        onSelectionChange={(users) =>
                          console.log("User filter:", users)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Filter by Action:
                    </label>
                    <div className="mt-1">
                      <ActionTypeFilter
                        selectedActions={[]}
                        onSelectionChange={(actions) =>
                          console.log("Action filter:", actions)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <AuditLogTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
