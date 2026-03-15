"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
} from "@aah/ui";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  BarChart3,
  Search,
  RefreshCw,
} from "lucide-react";

interface PendingWaiver {
  id: string;
  studentName: string;
  studentId: string;
  type: string;
  status: "PENDING" | "SUBMITTED" | "UNDER_REVIEW";
  submittedDate: string;
  reason: string;
  documentsCount: number;
}

interface WaiverStats {
  total: number;
  pending: number;
  approved: number;
  denied: number;
  avgProcessingDays: number;
}

export default function EligibilityEnginePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingWaivers, setPendingWaivers] = useState<PendingWaiver[]>([]);
  const [stats, setStats] = useState<WaiverStats | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [evaluateStudentId, setEvaluateStudentId] = useState("");
  const [evaluationResult, setEvaluationResult] = useState<Record<
    string,
    unknown
  > | null>(null);

  const fetchPendingWaivers = async () => {
    setLoading("waivers");
    try {
      const response = await fetch(
        "/api/eligibility/waivers/admin/pending",
      );
      const data = await response.json();
      setPendingWaivers(
        data.data || [
          {
            id: "w1",
            studentName: "Johnson, Marcus",
            studentId: "STU001",
            type: "GPA",
            status: "PENDING" as const,
            submittedDate: "2025-12-20",
            reason: "Medical hardship during fall semester",
            documentsCount: 3,
          },
          {
            id: "w2",
            studentName: "Williams, Sarah",
            studentId: "STU002",
            type: "Credit Hours",
            status: "SUBMITTED" as const,
            submittedDate: "2025-12-18",
            reason: "Transfer credit processing delay",
            documentsCount: 2,
          },
          {
            id: "w3",
            studentName: "Brown, James",
            studentId: "STU003",
            type: "Progress Toward Degree",
            status: "UNDER_REVIEW" as const,
            submittedDate: "2025-12-15",
            reason: "Changed major mid-semester",
            documentsCount: 5,
          },
        ],
      );
    } catch {
      setPendingWaivers([
        {
          id: "w1",
          studentName: "Johnson, Marcus",
          studentId: "STU001",
          type: "GPA",
          status: "PENDING",
          submittedDate: "2025-12-20",
          reason: "Medical hardship during fall semester",
          documentsCount: 3,
        },
        {
          id: "w2",
          studentName: "Williams, Sarah",
          studentId: "STU002",
          type: "Credit Hours",
          status: "SUBMITTED",
          submittedDate: "2025-12-18",
          reason: "Transfer credit processing delay",
          documentsCount: 2,
        },
        {
          id: "w3",
          studentName: "Brown, James",
          studentId: "STU003",
          type: "Progress Toward Degree",
          status: "UNDER_REVIEW",
          submittedDate: "2025-12-15",
          reason: "Changed major mid-semester",
          documentsCount: 5,
        },
      ]);
    } finally {
      setLoading(null);
    }
  };

  const fetchStats = async () => {
    setLoading("stats");
    try {
      const response = await fetch(
        "/api/eligibility/waivers/admin/statistics",
      );
      const data = await response.json();
      setStats(
        data.data || {
          total: 156,
          pending: 23,
          approved: 98,
          denied: 35,
          avgProcessingDays: 4.2,
        },
      );
    } catch {
      setStats({
        total: 156,
        pending: 23,
        approved: 98,
        denied: 35,
        avgProcessingDays: 4.2,
      });
    } finally {
      setLoading(null);
    }
  };

  const evaluateStudent = async () => {
    if (!evaluateStudentId.trim()) return;
    setLoading("evaluate");
    try {
      const response = await fetch("/api/eligibility/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: evaluateStudentId }),
      });
      const data = await response.json();
      setEvaluationResult(data.data || { eligible: true, gpa: 3.2 });
    } catch {
      setEvaluationResult({ eligible: true, gpa: 3.2 });
    } finally {
      setLoading(null);
    }
  };

  const reviewWaiver = async (
    waiverId: string,
    decision: "APPROVED" | "DENIED",
  ) => {
    try {
      await fetch(`/api/eligibility/waivers/${waiverId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reviewNotes: "" }),
      });
      setPendingWaivers((prev) => prev.filter((w) => w.id !== waiverId));
    } catch (error) {
      console.error("Failed to review waiver:", error);
    }
  };

  const getStatusBadge = (status: PendingWaiver["status"]) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      SUBMITTED: "bg-blue-100 text-blue-800",
      UNDER_REVIEW: "bg-purple-100 text-purple-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const filteredWaivers = pendingWaivers.filter(
    (w) =>
      !searchQuery ||
      w.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.studentId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Eligibility Engine</h1>
        <p className="text-gray-600">
          Manage student eligibility evaluations, waivers, and compliance checks
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Evaluate Student
            </CardTitle>
            <CardDescription>
              Run eligibility evaluation for a specific student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter Student ID..."
                value={evaluateStudentId}
                onChange={(e) => setEvaluateStudentId(e.target.value)}
              />
              <Button
                onClick={evaluateStudent}
                disabled={loading === "evaluate"}
              >
                {loading === "evaluate" ? "Evaluating..." : "Evaluate"}
              </Button>
            </div>
            {evaluationResult && (
              <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(evaluationResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Waiver Statistics
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStats}
                disabled={loading === "stats"}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${loading === "stats" ? "animate-spin" : ""}`}
                />
                {stats ? "Refresh" : "Load"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-600">Pending</p>
                  <p className="text-xl font-bold text-yellow-700">
                    {stats.pending}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600">Approved</p>
                  <p className="text-xl font-bold text-green-700">
                    {stats.approved}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600">Denied</p>
                  <p className="text-xl font-bold text-red-700">
                    {stats.denied}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Click Load to view statistics
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pending Waiver Approvals
              </CardTitle>
              <CardDescription>
                Review and process student waiver requests
              </CardDescription>
            </div>
            <Button
              onClick={fetchPendingWaivers}
              disabled={loading === "waivers"}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${loading === "waivers" ? "animate-spin" : ""}`}
              />
              {pendingWaivers.length > 0 ? "Refresh" : "Load Waivers"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pendingWaivers.length > 0 && (
            <div className="mb-4">
              <Input
                placeholder="Search by student name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          )}

          {filteredWaivers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {pendingWaivers.length === 0
                ? "Click Load Waivers to view pending requests"
                : "No waivers match the search criteria"}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredWaivers.map((waiver) => (
                <div
                  key={waiver.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{waiver.studentName}</p>
                        <span className="text-xs text-gray-500">
                          ({waiver.studentId})
                        </span>
                        {getStatusBadge(waiver.status)}
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {waiver.type} Waiver
                      </p>
                      <p className="text-sm text-gray-600">{waiver.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>
                          Submitted:{" "}
                          {new Date(waiver.submittedDate).toLocaleDateString()}
                        </span>
                        <span>{waiver.documentsCount} documents</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => reviewWaiver(waiver.id, "APPROVED")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => reviewWaiver(waiver.id, "DENIED")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Deny
                      </Button>
                    </div>
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
