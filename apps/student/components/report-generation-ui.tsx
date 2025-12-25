"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@aah/ui";
import { Button } from "@aah/ui";
import { Label } from "@aah/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aah/ui";
import {
  FileText,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@aah/ui";

export interface Report {
  id: string;
  type: string;
  format: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  completedAt: Date | null;
}

export function ReportGenerationUI() {
  const [reportType, setReportType] = useState<string>("");
  const [format, setFormat] = useState<string>("PDF");
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      type: "ELIGIBILITY",
      format: "PDF",
      status: "COMPLETED",
      progress: 100,
      fileName: "eligibility-report.pdf",
      fileSize: 2458000,
      createdAt: new Date("2024-12-15"),
      completedAt: new Date("2024-12-15"),
    },
  ]);

  const handleGenerateReport = async () => {
    if (!reportType) return;
    setGenerating(true);

    setTimeout(() => {
      const newReport: Report = {
        id: crypto.randomUUID(),
        type: reportType,
        format,
        status: "PENDING",
        progress: 0,
        fileName: null,
        fileSize: null,
        createdAt: new Date(),
        completedAt: null,
      };
      setReports([newReport, ...reports]);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setReports((prev) =>
          prev.map((r) =>
            r.id === newReport.id
              ? { ...r, progress, status: "PROCESSING" as any }
              : r,
          ),
        );

        if (progress >= 100) {
          clearInterval(interval);
          setReports((prev) =>
            prev.map((r) =>
              r.id === newReport.id
                ? {
                    ...r,
                    status: "COMPLETED" as any,
                    fileName: `${reportType.toLowerCase()}-report-${Date.now()}.pdf`,
                    fileSize: 2458000,
                    completedAt: new Date(),
                  }
                : r,
            ),
          );
          setGenerating(false);
        }
      }, 500);
    }, 1000);
  };

  const handleDownload = (report: Report) => {
    if (report.status === "COMPLETED" && report.fileName) {
      console.log("Downloading report:", report.fileName);
    }
  };

  const getStatusBadge = (status: Report["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Processing
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            Pending
          </span>
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports</h2>
        <p className="text-muted-foreground mt-1">
          Generate and download eligibility and compliance reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELIGIBILITY">
                    Eligibility Report
                  </SelectItem>
                  <SelectItem value="TRANSFER_CREDIT">
                    Transfer Credit Report
                  </SelectItem>
                  <SelectItem value="COMPLIANCE">Compliance Report</SelectItem>
                  <SelectItem value="PROGRESS">Progress Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                  <SelectItem value="JSON">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerateReport}
            disabled={!reportType || generating}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-3 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">No reports generated yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {report.fileName || `${report.type} Report`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {report.format} •{" "}
                        {report.createdAt.toLocaleDateString()}
                        {report.fileSize &&
                          ` • ${formatFileSize(report.fileSize)}`}
                      </p>
                      {report.status === "PROCESSING" && (
                        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{ width: `${report.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(report.status)}
                    {report.status === "COMPLETED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(report)}
                        aria-label={`Download ${report.fileName}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
