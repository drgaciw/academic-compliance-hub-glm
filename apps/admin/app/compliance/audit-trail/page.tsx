"use client";

import { useState, useMemo } from "react";
import {
  ClipboardList,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  LayoutDashboard,
  Upload,
  FileCheck,
  Link2,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aah/ui";

enum AgentType {
  EVALUATION_AGENT = "EVALUATION_AGENT",
  COMPLIANCE_AGENT = "COMPLIANCE_AGENT",
  DOCUMENT_AGENT = "DOCUMENT_AGENT",
  RULE_ENGINE = "RULE_ENGINE",
  NOTIFICATION_AGENT = "NOTIFICATION_AGENT",
  ADVISOR_AGENT = "ADVISOR_AGENT",
}

interface AuditLog {
  id: string;
  transferEvaluationId: string;
  agentType: AgentType;
  action: string;
  inputData: any;
  outputData: any;
  errorMessage: string | null;
  duration: number | null;
  timestamp: Date;
}

interface Filters {
  agentType: string;
  action: string;
  startDate: string;
  endDate: string;
  transferEvaluationId: string;
}

const AGENT_TYPES = [
  { value: "", label: "All Agents" },
  { value: "EVALUATION_AGENT", label: "Evaluation Agent" },
  { value: "COMPLIANCE_AGENT", label: "Compliance Agent" },
  { value: "DOCUMENT_AGENT", label: "Document Agent" },
  { value: "RULE_ENGINE", label: "Rule Engine" },
  { value: "NOTIFICATION_AGENT", label: "Notification Agent" },
  { value: "ADVISOR_AGENT", label: "Advisor Agent" },
];

const ACTION_TYPES = [
  { value: "", label: "All Actions" },
  { value: "ELIGIBILITY_EVALUATION", label: "Eligibility Evaluation" },
  { value: "COMPLIANCE_CHECK", label: "Compliance Check" },
  { value: "DOCUMENT_PROCESSING", label: "Document Processing" },
  { value: "RULE_APPLICATION", label: "Rule Application" },
  { value: "NOTIFICATION_SENT", label: "Notification Sent" },
  { value: "USER_ACTION", label: "User Action" },
];

const MOCK_LOGS: AuditLog[] = [
  {
    id: "1",
    transferEvaluationId: "eval-001",
    agentType: AgentType.EVALUATION_AGENT,
    action: "ELIGIBILITY_EVALUATION",
    inputData: {
      studentId: "STU-12345",
      credits: 45,
      gpa: 3.2,
    },
    outputData: {
      eligible: true,
      confidenceScore: 0.95,
      reasons: ["Meets credit requirement", "GPA above threshold"],
    },
    errorMessage: null,
    duration: 1250,
    timestamp: new Date("2025-12-23T10:30:00Z"),
  },
  {
    id: "2",
    transferEvaluationId: "eval-001",
    agentType: AgentType.DOCUMENT_AGENT,
    action: "DOCUMENT_PROCESSING",
    inputData: {
      documentType: "transcript",
      fileUrl: "https://example.com/transcripts/stu-12345.pdf",
    },
    outputData: {
      extractedCourses: 15,
      extractionStatus: "completed",
    },
    errorMessage: null,
    duration: 3200,
    timestamp: new Date("2025-12-23T10:28:00Z"),
  },
  {
    id: "3",
    transferEvaluationId: "eval-001",
    agentType: AgentType.COMPLIANCE_AGENT,
    action: "COMPLIANCE_CHECK",
    inputData: {
      bylawNumbers: ["14.3.2.2", "14.3.3.1"],
      studentData: {
        credits: 45,
        gpa: 3.2,
      },
    },
    outputData: {
      compliant: true,
      violations: [],
    },
    errorMessage: null,
    duration: 890,
    timestamp: new Date("2025-12-23T10:31:00Z"),
  },
  {
    id: "4",
    transferEvaluationId: "eval-002",
    agentType: AgentType.DOCUMENT_AGENT,
    action: "DOCUMENT_PROCESSING",
    inputData: {
      documentType: "transcript",
      fileUrl: "https://example.com/transcripts/stu-67890.pdf",
    },
    outputData: null,
    errorMessage: "Failed to parse document: Invalid PDF format",
    duration: 4500,
    timestamp: new Date("2025-12-23T09:15:00Z"),
  },
  {
    id: "5",
    transferEvaluationId: "eval-002",
    agentType: AgentType.RULE_ENGINE,
    action: "RULE_APPLICATION",
    inputData: {
      ruleId: "14.3.2.2",
      context: {
        transferCredits: 30,
        maxAllowed: 30,
      },
    },
    outputData: {
      passed: true,
      details: "Transfer credits within limit",
    },
    errorMessage: null,
    duration: 150,
    timestamp: new Date("2025-12-23T09:16:00Z"),
  },
  {
    id: "6",
    transferEvaluationId: "eval-003",
    agentType: AgentType.NOTIFICATION_AGENT,
    action: "NOTIFICATION_SENT",
    inputData: {
      recipient: "advisor@example.com",
      type: "ELIGIBILITY_UPDATE",
    },
    outputData: {
      delivered: true,
      messageId: "msg-abc123",
    },
    errorMessage: null,
    duration: 420,
    timestamp: new Date("2025-12-22T16:45:00Z"),
  },
  {
    id: "7",
    transferEvaluationId: "eval-003",
    agentType: AgentType.EVALUATION_AGENT,
    action: "ELIGIBILITY_EVALUATION",
    inputData: {
      studentId: "STU-54321",
      credits: 42,
      gpa: 2.8,
    },
    outputData: {
      eligible: false,
      confidenceScore: 0.88,
      reasons: ["GPA below minimum threshold"],
    },
    errorMessage: null,
    duration: 1100,
    timestamp: new Date("2025-12-22T16:42:00Z"),
  },
  {
    id: "8",
    transferEvaluationId: "eval-001",
    agentType: AgentType.ADVISOR_AGENT,
    action: "USER_ACTION:VIEW",
    inputData: {
      userId: "advisor-123",
      dataType: "EVALUATION",
      studentId: "STU-12345",
      reason: "Review eligibility status",
    },
    outputData: {
      success: true,
    },
    errorMessage: null,
    duration: 50,
    timestamp: new Date("2025-12-23T10:35:00Z"),
  },
];

export default function AuditTrailPage() {
  const [filters, setFilters] = useState<Filters>({
    agentType: "",
    action: "",
    startDate: "",
    endDate: "",
    transferEvaluationId: "",
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter((log) => {
      if (filters.agentType && log.agentType !== filters.agentType)
        return false;
      if (filters.action && !log.action.includes(filters.action)) return false;
      if (
        filters.transferEvaluationId &&
        log.transferEvaluationId !== filters.transferEvaluationId
      )
        return false;
      if (
        filters.startDate &&
        new Date(log.timestamp) < new Date(filters.startDate)
      )
        return false;
      if (
        filters.endDate &&
        new Date(log.timestamp) > new Date(filters.endDate)
      )
        return false;
      return true;
    });
  }, [filters]);

  const getAgentTypeLabel = (type: AgentType) => {
    const found = AGENT_TYPES.find((a) => a.value === type);
    return found?.label || type;
  };

  const getStatusIcon = (log: AuditLog) => {
    if (log.errorMessage) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getLatencyColor = (ms: number | null) => {
    if (ms === null) return "text-gray-500";
    if (ms < 500) return "text-green-600";
    if (ms < 2000) return "text-yellow-600";
    return "text-red-600";
  };

  const exportToCSV = () => {
    const headers = [
      "Timestamp",
      "Evaluation ID",
      "Agent Type",
      "Action",
      "Status",
      "Duration (ms)",
    ];
    const rows = filteredLogs.map((log) => [
      formatTimestamp(log.timestamp),
      log.transferEvaluationId,
      log.agentType,
      log.action,
      log.errorMessage ? "ERROR" : "SUCCESS",
      log.duration?.toString() || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit-trail-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const groupedLogs = useMemo(() => {
    const groups = filteredLogs.reduce(
      (acc, log) => {
        if (!acc[log.transferEvaluationId]) {
          acc[log.transferEvaluationId] = [];
        }
        acc[log.transferEvaluationId].push(log);
        return acc;
      },
      {} as Record<string, AuditLog[]>,
    );

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });

    return groups;
  }, [filteredLogs]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white shadow-lg dark:bg-gray-800 lg:static">
        <div className="flex h-16 items-center justify-between border-b px-6 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Compliance Hub
          </h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {[
              {
                href: "/compliance/dashboard",
                label: "Dashboard",
                icon: LayoutDashboard,
              },
              {
                href: "/compliance/upload",
                label: "Transcript Upload",
                icon: Upload,
              },
              {
                href: "/compliance/review",
                label: "Eligibility Review",
                icon: FileCheck,
              },
              {
                href: "/compliance/mapping",
                label: "Course Mapping",
                icon: Link2,
              },
              {
                href: "/compliance/reports",
                label: "Reports",
                icon: BarChart3,
              },
              {
                href: "/compliance/audit-trail",
                label: "Audit Trail",
                icon: ClipboardList,
              },
            ].map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    item.href === "/compliance/audit-trail"
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex flex-1 flex-col lg:ml-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:px-6">
          <div className="flex items-center gap-4">
            <ClipboardList className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Audit Trail
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit Log Viewer</CardTitle>
                  <CardDescription>
                    Track and monitor all compliance evaluation activities
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                  {showFilters ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showFilters && (
                <div className="mb-6 grid gap-4 border-b pb-6 dark:border-gray-700 md:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Agent Type
                    </label>
                    <Select
                      value={filters.agentType}
                      onValueChange={(value) =>
                        setFilters({ ...filters, agentType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent type" />
                      </SelectTrigger>
                      <SelectContent>
                        {AGENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Action Type
                    </label>
                    <Select
                      value={filters.action}
                      onValueChange={(value) =>
                        setFilters({ ...filters, action: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map((action) => (
                          <SelectItem key={action.value} value={action.value}>
                            {action.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Evaluation ID
                    </label>
                    <Input
                      placeholder="Enter evaluation ID"
                      value={filters.transferEvaluationId}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          transferEvaluationId: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        setFilters({ ...filters, startDate: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        setFilters({ ...filters, endDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-end md:col-span-2 lg:col-span-5">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFilters({
                          agentType: "",
                          action: "",
                          startDate: "",
                          endDate: "",
                          transferEvaluationId: "",
                        })
                      }
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              )}

              <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {filteredLogs.length} of {MOCK_LOGS.length} logs
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white"></th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        Evaluation ID
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        Agent
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                        Latency
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <>
                        <tr
                          key={log.id}
                          className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(log.id)}
                            >
                              {expandedRow === log.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white">
                            {formatTimestamp(log.timestamp)}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                            {log.transferEvaluationId}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                            {getAgentTypeLabel(log.agentType)}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                            {log.action}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log)}
                              <span
                                className={
                                  log.errorMessage
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-green-600 dark:text-green-400"
                                }
                              >
                                {log.errorMessage ? "ERROR" : "SUCCESS"}
                              </span>
                            </div>
                          </td>
                          <td
                            className={`px-4 py-3 ${getLatencyColor(log.duration)}`}
                          >
                            {formatDuration(log.duration)}
                          </td>
                        </tr>
                        {expandedRow === log.id && (
                          <tr className="border-b dark:border-gray-700">
                            <td
                              colSpan={7}
                              className="px-4 py-4 bg-gray-50 dark:bg-gray-800/50"
                            >
                              <div className="space-y-4">
                                {log.errorMessage && (
                                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-800 dark:text-red-300">
                                      <AlertCircle className="h-4 w-4" />
                                      Error Message
                                    </div>
                                    <p className="text-sm text-red-700 dark:text-red-400">
                                      {log.errorMessage}
                                    </p>
                                  </div>
                                )}

                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                      <ArrowRight className="h-4 w-4" />
                                      Input Data
                                    </div>
                                    <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-4 text-xs dark:border-gray-700 dark:bg-gray-900">
                                      {JSON.stringify(log.inputData, null, 2)}
                                    </pre>
                                  </div>

                                  <div>
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                      <ArrowRight className="h-4 w-4" />
                                      Output Data
                                    </div>
                                    <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-4 text-xs dark:border-gray-700 dark:bg-gray-900">
                                      {log.outputData
                                        ? JSON.stringify(
                                            log.outputData,
                                            null,
                                            2,
                                          )
                                        : "No output data"}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>

                {filteredLogs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <Search className="mb-4 h-12 w-12" />
                    <p>No audit logs found matching your filters</p>
                    <Button
                      variant="link"
                      className="mt-2"
                      onClick={() =>
                        setFilters({
                          agentType: "",
                          action: "",
                          startDate: "",
                          endDate: "",
                          transferEvaluationId: "",
                        })
                      }
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>

              {Object.keys(groupedLogs).length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Timeline Visualization
                  </h3>
                  <div className="space-y-6">
                    {Object.entries(groupedLogs).map(([evaluationId, logs]) => (
                      <Card
                        key={evaluationId}
                        className="border border-gray-200 dark:border-gray-700"
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            Evaluation: {evaluationId}
                          </CardTitle>
                          <CardDescription>
                            {logs.length} events from{" "}
                            {formatTimestamp(logs[0].timestamp)} to{" "}
                            {formatTimestamp(logs[logs.length - 1].timestamp)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="relative">
                            <div className="absolute left-[11px] top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
                            <div className="space-y-4">
                              {logs.map((log, index) => (
                                <div
                                  key={log.id}
                                  className="relative flex items-start gap-4 pl-8"
                                >
                                  <div
                                    className={`absolute left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                      log.errorMessage
                                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                        : "border-green-500 bg-green-50 dark:bg-green-900/20"
                                    }`}
                                  >
                                    <Activity
                                      className={`h-3 w-3 ${
                                        log.errorMessage
                                          ? "text-red-600 dark:text-red-400"
                                          : "text-green-600 dark:text-green-400"
                                      }`}
                                    />
                                  </div>
                                  <div className="flex-1 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="mb-2 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {log.action}
                                        </span>
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                          {getAgentTypeLabel(log.agentType)}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDuration(log.duration)}
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-300">
                                      {formatTimestamp(log.timestamp)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
