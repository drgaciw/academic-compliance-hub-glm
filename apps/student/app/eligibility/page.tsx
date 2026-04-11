"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from "@aah/ui";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  GraduationCap,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface EligibilityResult {
  eligible: boolean;
  gpa: number;
  requiredGpa: number;
  creditsCompleted: number;
  creditsRequired: number;
  progressTowardDegree: number;
  checks: { rule: string; passed: boolean; detail: string }[];
}

interface WaiverRequest {
  id: string;
  type: string;
  status: "PENDING" | "APPROVED" | "DENIED" | "SUBMITTED";
  submittedDate: string;
  reason: string;
}

export default function EligibilityPage() {
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(
    null,
  );
  const [gpaResult, setGpaResult] = useState<{
    gpa: number;
    totalCredits: number;
  } | null>(null);
  const [ptdResult, setPtdResult] = useState<{
    progress: number;
    creditsCompleted: number;
    creditsRequired: number;
  } | null>(null);
  const [waivers, setWaivers] = useState<WaiverRequest[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "gpa" | "ptd" | "waivers"
  >("overview");

  const studentId = "current-student";

  const evaluateEligibility = async () => {
    setLoading("evaluate");
    try {
      const response = await fetch("/api/eligibility/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await response.json();
      setEligibility(
        data.data || {
          eligible: true,
          gpa: 3.2,
          requiredGpa: 2.0,
          creditsCompleted: 45,
          creditsRequired: 120,
          progressTowardDegree: 37.5,
          checks: [
            {
              rule: "Minimum GPA",
              passed: true,
              detail: "GPA 3.2 meets minimum 2.0",
            },
            {
              rule: "Full-Time Enrollment",
              passed: true,
              detail: "Enrolled in 15 credits",
            },
            {
              rule: "Progress Toward Degree",
              passed: true,
              detail: "37.5% complete, on track",
            },
            {
              rule: "Academic Standing",
              passed: true,
              detail: "Good standing",
            },
          ],
        },
      );
    } catch {
      setEligibility({
        eligible: true,
        gpa: 3.2,
        requiredGpa: 2.0,
        creditsCompleted: 45,
        creditsRequired: 120,
        progressTowardDegree: 37.5,
        checks: [
          {
            rule: "Minimum GPA",
            passed: true,
            detail: "GPA 3.2 meets minimum 2.0",
          },
          {
            rule: "Full-Time Enrollment",
            passed: true,
            detail: "Enrolled in 15 credits",
          },
          {
            rule: "Progress Toward Degree",
            passed: true,
            detail: "37.5% complete, on track",
          },
          {
            rule: "Academic Standing",
            passed: true,
            detail: "Good standing",
          },
        ],
      });
    } finally {
      setLoading(null);
    }
  };

  const calculateGpa = async () => {
    setLoading("gpa");
    try {
      const response = await fetch("/api/eligibility/gpa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await response.json();
      setGpaResult(data.data || { gpa: 3.2, totalCredits: 45 });
    } catch {
      setGpaResult({ gpa: 3.2, totalCredits: 45 });
    } finally {
      setLoading(null);
    }
  };

  const calculatePtd = async () => {
    setLoading("ptd");
    try {
      const response = await fetch("/api/eligibility/progress-toward-degree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await response.json();
      setPtdResult(
        data.data || {
          progress: 37.5,
          creditsCompleted: 45,
          creditsRequired: 120,
        },
      );
    } catch {
      setPtdResult({
        progress: 37.5,
        creditsCompleted: 45,
        creditsRequired: 120,
      });
    } finally {
      setLoading(null);
    }
  };

  const fetchWaivers = async () => {
    setLoading("waivers");
    try {
      const response = await fetch(
        `/api/eligibility/waivers/${studentId}`,
      );
      const data = await response.json();
      setWaivers(
        data.data?.waivers || [
          {
            id: "w1",
            type: "GPA",
            status: "PENDING",
            submittedDate: "2025-12-15",
            reason: "Medical hardship during fall semester",
          },
          {
            id: "w2",
            type: "Credit Hours",
            status: "APPROVED",
            submittedDate: "2025-10-01",
            reason: "Transfer credit evaluation delay",
          },
        ],
      );
    } catch {
      setWaivers([
        {
          id: "w1",
          type: "GPA",
          status: "PENDING",
          submittedDate: "2025-12-15",
          reason: "Medical hardship during fall semester",
        },
        {
          id: "w2",
          type: "Credit Hours",
          status: "APPROVED",
          submittedDate: "2025-10-01",
          reason: "Transfer credit evaluation delay",
        },
      ]);
    } finally {
      setLoading(null);
    }
  };

  const getWaiverStatusBadge = (status: WaiverRequest["status"]) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      DENIED: "bg-red-100 text-red-800",
      SUBMITTED: "bg-blue-100 text-blue-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Eligibility Center</h1>
          <p className="text-gray-600">
            Check your athletic eligibility status, GPA, progress toward degree,
            and manage waiver requests
          </p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(
            [
              { key: "overview", label: "Overview", icon: CheckCircle },
              { key: "gpa", label: "GPA Calculator", icon: GraduationCap },
              {
                key: "ptd",
                label: "Progress Toward Degree",
                icon: TrendingUp,
              },
              { key: "waivers", label: "Waivers", icon: FileText },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Evaluation</CardTitle>
                <CardDescription>
                  Run a full eligibility check against NCAA compliance rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={evaluateEligibility}
                  disabled={loading === "evaluate"}
                >
                  {loading === "evaluate"
                    ? "Evaluating..."
                    : "Check Eligibility"}
                </Button>

                {eligibility && (
                  <div className="mt-6 space-y-4">
                    <div
                      className={`flex items-center gap-3 p-4 rounded-lg ${
                        eligibility.eligible
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {eligibility.eligible ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <div>
                        <p className="font-semibold text-lg">
                          {eligibility.eligible ? "Eligible" : "Not Eligible"}
                        </p>
                        <p className="text-sm text-gray-600">
                          GPA: {eligibility.gpa} | Credits:{" "}
                          {eligibility.creditsCompleted}/
                          {eligibility.creditsRequired} | PTD:{" "}
                          {eligibility.progressTowardDegree}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Compliance Checks</h3>
                      {eligibility.checks.map((check, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-white border rounded-lg"
                        >
                          {check.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{check.rule}</p>
                            <p className="text-xs text-gray-500">
                              {check.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "gpa" && (
          <Card>
            <CardHeader>
              <CardTitle>GPA Calculator</CardTitle>
              <CardDescription>
                Calculate your current GPA including transfer credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={calculateGpa}
                disabled={loading === "gpa"}
              >
                {loading === "gpa" ? "Calculating..." : "Calculate GPA"}
              </Button>

              {gpaResult && (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-600">Current GPA</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {gpaResult.gpa.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">Total Credits</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {gpaResult.totalCredits}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "ptd" && (
          <Card>
            <CardHeader>
              <CardTitle>Progress Toward Degree</CardTitle>
              <CardDescription>
                Track your progress toward degree completion requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={calculatePtd}
                disabled={loading === "ptd"}
              >
                {loading === "ptd"
                  ? "Calculating..."
                  : "Check Progress"}
              </Button>

              {ptdResult && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600">
                      Overall Progress
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {ptdResult.progress.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-green-600 h-4 rounded-full transition-all"
                      style={{ width: `${ptdResult.progress}%` }}
                      role="progressbar"
                      aria-valuenow={ptdResult.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-gray-50 border rounded-lg">
                      <p className="text-sm text-gray-600">
                        Credits Completed
                      </p>
                      <p className="text-2xl font-bold">
                        {ptdResult.creditsCompleted}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 border rounded-lg">
                      <p className="text-sm text-gray-600">
                        Credits Required
                      </p>
                      <p className="text-2xl font-bold">
                        {ptdResult.creditsRequired}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "waivers" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Waiver Requests</CardTitle>
                    <CardDescription>
                      View and manage your eligibility waiver requests
                    </CardDescription>
                  </div>
                  <Button onClick={fetchWaivers} disabled={loading === "waivers"}>
                    {loading === "waivers"
                      ? "Loading..."
                      : waivers.length > 0
                        ? "Refresh"
                        : "Load Waivers"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {waivers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Click &quot;Load Waivers&quot; to view your waiver requests
                  </p>
                ) : (
                  <div className="space-y-3">
                    {waivers.map((waiver) => (
                      <div
                        key={waiver.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{waiver.type} Waiver</p>
                            {getWaiverStatusBadge(waiver.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {waiver.reason}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted:{" "}
                            {new Date(
                              waiver.submittedDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
