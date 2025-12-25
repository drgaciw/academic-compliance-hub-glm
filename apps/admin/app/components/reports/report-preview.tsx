"use client";

import { useState } from "react";
import { Eye, FileText, Download, RefreshCw } from "lucide-react";
import { Button } from "@aah/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@aah/ui";
import { Badge } from "@aah/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@aah/ui";
import { DataTable } from "@aah/ui";

interface ReportData {
  id: string;
  studentName: string;
  studentId: string;
  transferCourse: string;
  targetCourse: string;
  credits: number;
  status: "Approved" | "Pending" | "Rejected" | "Review Required";
  submittedDate: string;
  reviewedBy?: string;
}

interface ReportPreviewProps {
  title: string;
  description: string;
  trigger?: React.ReactNode;
}

export function ReportPreview({
  title,
  description,
  trigger,
}: ReportPreviewProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const mockData: ReportData[] = [
    {
      id: "1",
      studentName: "John Smith",
      studentId: "STU001",
      transferCourse: "MATH 101 - Calculus I",
      targetCourse: "MATH 201 - Calculus II",
      credits: 4,
      status: "Approved",
      submittedDate: "2024-01-15",
      reviewedBy: "Dr. Johnson",
    },
    {
      id: "2",
      studentName: "Sarah Johnson",
      studentId: "STU002",
      transferCourse: "ENGL 101 - Composition",
      targetCourse: "ENGL 201 - Advanced Writing",
      credits: 3,
      status: "Pending",
      submittedDate: "2024-01-16",
    },
    {
      id: "3",
      studentName: "Michael Brown",
      studentId: "STU003",
      transferCourse: "PHYS 101 - Physics I",
      targetCourse: "PHYS 201 - Physics II",
      credits: 4,
      status: "Review Required",
      submittedDate: "2024-01-17",
    },
    {
      id: "4",
      studentName: "Emily Davis",
      studentId: "STU004",
      transferCourse: "CHEM 101 - Chemistry I",
      targetCourse: "CHEM 201 - Organic Chemistry",
      credits: 4,
      status: "Approved",
      submittedDate: "2024-01-18",
      reviewedBy: "Dr. Smith",
    },
    {
      id: "5",
      studentName: "James Wilson",
      studentId: "STU005",
      transferCourse: "BIOL 101 - Biology I",
      targetCourse: "BIOL 201 - Biology II",
      credits: 4,
      status: "Rejected",
      submittedDate: "2024-01-19",
      reviewedBy: "Dr. Johnson",
    },
  ];

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const columns = [
    {
      accessorKey: "studentName",
      header: "Student Name",
    },
    {
      accessorKey: "studentId",
      header: "Student ID",
    },
    {
      accessorKey: "transferCourse",
      header: "Transfer Course",
    },
    {
      accessorKey: "targetCourse",
      header: "Target Course",
    },
    {
      accessorKey: "credits",
      header: "Credits",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={
              status === "Approved"
                ? "default"
                : status === "Pending"
                  ? "secondary"
                  : status === "Rejected"
                    ? "destructive"
                    : "outline"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "submittedDate",
      header: "Submitted Date",
    },
    {
      accessorKey: "reviewedBy",
      header: "Reviewed By",
    },
  ];

  const stats = [
    { label: "Total Records", value: mockData.length },
    {
      label: "Approved",
      value: mockData.filter((d) => d.status === "Approved").length,
    },
    {
      label: "Pending",
      value: mockData.filter((d) => d.status === "Pending").length,
    },
    {
      label: "Rejected",
      value: mockData.filter((d) => d.status === "Rejected").length,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <DataTable
            columns={columns as any}
            data={mockData}
            pageSize={10}
            filterPlaceholder="Search records..."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
