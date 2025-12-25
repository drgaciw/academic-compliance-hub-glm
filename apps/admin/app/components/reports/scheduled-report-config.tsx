"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Mail,
  Download,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import { Button } from "@aah/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aah/ui";
import { Input } from "@aah/ui";
import { Label } from "@aah/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aah/ui";
import { Checkbox } from "@aah/ui";
import { Badge } from "@aah/ui";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aah/ui";

export type ScheduleFrequency = "daily" | "weekly" | "monthly" | "quarterly";
export type ExportFormat = "pdf" | "csv" | "excel";

export interface ScheduledReport {
  id: string;
  name: string;
  frequency: ScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  format: ExportFormat;
  recipients: string[];
  enabled: boolean;
}

interface ScheduleReportConfigProps {
  onSave?: (report: ScheduledReport) => void;
  existingReports?: ScheduledReport[];
}

export function ScheduleReportConfig({
  onSave,
  existingReports = [],
}: ScheduleReportConfigProps) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<ScheduleFrequency>("weekly");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState("");
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [reports, setReports] = useState<ScheduledReport[]>(existingReports);

  const handleAddRecipient = () => {
    if (newRecipient && !emailRecipients.includes(newRecipient)) {
      setEmailRecipients([...emailRecipients, newRecipient]);
      setNewRecipient("");
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setEmailRecipients(emailRecipients.filter((e) => e !== email));
  };

  const handleSave = () => {
    const report: ScheduledReport = {
      id: Date.now().toString(),
      name,
      frequency,
      dayOfWeek:
        frequency === "weekly" || frequency === "monthly"
          ? dayOfWeek
          : undefined,
      dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
      format,
      recipients: emailRecipients,
      enabled: true,
    };

    setReports([...reports, report]);
    onSave?.(report);

    setName("");
    setFrequency("weekly");
    setEmailRecipients([]);
  };

  const handleToggleEnabled = (reportId: string) => {
    setReports(
      reports.map((r) =>
        r.id === reportId ? { ...r, enabled: !r.enabled } : r,
      ),
    );
  };

  const handleDelete = (reportId: string) => {
    setReports(reports.filter((r) => r.id !== reportId));
  };

  const getFrequencyLabel = (freq: ScheduleFrequency) => {
    switch (freq) {
      case "daily":
        return "Every Day";
      case "weekly":
        return `Every ${getDayName(dayOfWeek)}`;
      case "monthly":
        return `Day ${dayOfMonth} of Month`;
      case "quarterly":
        return "Every Quarter";
      default:
        return freq;
    }
  };

  const getDayName = (day: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[day];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Scheduled Report</CardTitle>
          <CardDescription>
            Configure automated report generation and delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Report Name</Label>
            <Input
              id="name"
              placeholder="e.g., Weekly Transfer Credits Report"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as ScheduleFrequency)}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequency === "weekly" && (
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select
                  value={String(dayOfWeek)}
                  onValueChange={(v) => setDayOfWeek(Number(v))}
                >
                  <SelectTrigger id="dayOfWeek">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {frequency === "monthly" && (
              <div className="space-y-2">
                <Label htmlFor="dayOfMonth">Day of Month</Label>
                <Select
                  value={String(dayOfMonth)}
                  onValueChange={(v) => setDayOfMonth(Number(v))}
                >
                  <SelectTrigger id="dayOfMonth">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select
                value={format}
                onValueChange={(v) => setFormat(v as ExportFormat)}
              >
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Recipients</Label>
            <div className="flex gap-2">
              <Input
                placeholder="email@example.com"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRecipient()}
              />
              <Button
                type="button"
                onClick={handleAddRecipient}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {emailRecipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {emailRecipients.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1">
                    <Mail className="h-3 w-3" />
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipient(email)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Attachments</Label>
                <p className="text-xs text-muted-foreground">
                  Attach report files to email
                </p>
              </div>
              <Checkbox
                checked={includeAttachments}
                onCheckedChange={(v) => setIncludeAttachments(v as boolean)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Download</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically download to reports folder
                </p>
              </div>
              <Checkbox
                checked={autoDownload}
                onCheckedChange={(v) => setAutoDownload(v as boolean)}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Schedule
          </Button>
        </CardContent>
      </Card>

      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Active scheduled reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{report.name}</h4>
                    {!report.enabled && (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getFrequencyLabel(report.frequency)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {report.format.toUpperCase()}
                    </span>
                    {report.recipients.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {report.recipients.length} recipient(s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={report.enabled}
                    onCheckedChange={() => handleToggleEnabled(report.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(report.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
