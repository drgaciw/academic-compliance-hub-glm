"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Label,
} from "@aah/ui";
import {
  ArrowLeft,
  Check,
  X,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Edit3,
  History,
  ShieldAlert,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

const mockViolation = {
  id: "vio-001",
  ruleName: "Credit Hours Transferability",
  description:
    "Course BIO 101 (4 credits) may not transfer as General Biology due to curriculum differences",
  severity: "high" as const,
  sourceCourse: {
    code: "BIO 101",
    title: "Introduction to Biology",
    credits: 4,
    grade: "A-",
  },
  targetCourse: {
    code: "BIO 150",
    title: "General Biology",
    credits: 4,
  },
  category: "Core Science Requirement",
  applicableRules: [
    "Transfer credits must be from equivalent courses",
    "Minimum grade requirement: C or higher",
    "Science courses require lab component verification",
  ],
  autoDecision: "reject",
};

const mockOverrideHistory = [
  {
    id: "override-001",
    violationId: "vio-002",
    overriddenAt: "2025-12-18T10:30:00Z",
    overriddenBy: "Dr. Sarah Miller",
    reason:
      "Student completed additional lab work at source institution - verified through transcript notes",
    previousDecision: "reject",
    newDecision: "approve",
  },
  {
    id: "override-002",
    violationId: "vio-005",
    overriddenAt: "2025-12-17T14:15:00Z",
    overriddenBy: "Dr. James Wilson",
    reason: "Course equivalency confirmed via department chair review",
    previousDecision: "reject",
    newDecision: "approve",
  },
];

export default function EvaluationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<string | null>(
    null,
  );
  const [overrideReason, setOverrideReason] = useState("");
  const [expandableViolations, setExpandableViolations] = useState<Set<string>>(
    new Set(["vio-001"]),
  );
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(
    new Set(),
  );

  const violations = [mockViolation];

  const toggleViolationExpansion = (id: string) => {
    setExpandableViolations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleHistoryExpansion = (id: string) => {
    setExpandedHistory((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOverride = () => {
    if (!overrideReason.trim()) {
      alert("Please provide a justification for the override");
      return;
    }

    alert(`Override applied for violation ${selectedViolation}`);
    setShowOverrideModal(false);
    setOverrideReason("");
    setSelectedViolation(null);
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
      medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          styles[severity as keyof typeof styles] || styles.low
        }`}
      >
        {severity}
      </span>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/compliance/eligibility-review">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Eligibility Review</h1>
          <p className="text-muted-foreground mt-1">
            Evaluation ID: {params.id} | Student: John Smith (STU001)
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Side-by-Side Transcript Comparison</CardTitle>
              <CardDescription>
                Compare source and target course details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Source Institution
                    </div>
                    <div className="font-semibold">University of Texas</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Student ID: STU001
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start gap-2 mb-3">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">
                          {mockViolation.sourceCourse.code}:{" "}
                          {mockViolation.sourceCourse.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {mockViolation.sourceCourse.credits} Credits • Grade:{" "}
                          {mockViolation.sourceCourse.grade}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Target Institution
                    </div>
                    <div className="font-semibold">University of Alabama</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Transfer Credits Pending
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg border-dashed">
                    <div className="flex items-start gap-2 mb-3">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">
                          {mockViolation.targetCourse.code}:{" "}
                          {mockViolation.targetCourse.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {mockViolation.targetCourse.credits} Credits
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800 dark:text-yellow-400">
                      Transferability Concern
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                      {mockViolation.description}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rule Application & Violations</CardTitle>
              <CardDescription>
                {violations.length} violation
                {violations.length !== 1 ? "s" : ""} detected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {violations.map((violation) => (
                <div
                  key={violation.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div
                    className="p-4 bg-muted/30 flex items-start justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleViolationExpansion(violation.id)}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                        <span className="font-medium">
                          {violation.ruleName}
                        </span>
                        {getSeverityBadge(violation.severity)}
                      </div>
                      <div className="text-sm text-muted-foreground pl-6">
                        {violation.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setSelectedViolation(violation.id);
                          setShowOverrideModal(true);
                        }}
                      >
                        Override
                      </Button>
                      {expandableViolations.has(violation.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {expandableViolations.has(violation.id) && (
                    <div className="p-4 border-t space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Category</Label>
                        <div className="text-sm mt-1">{violation.category}</div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Applicable Rules
                        </Label>
                        <ul className="list-disc list-inside text-sm mt-1 space-y-1 text-muted-foreground">
                          {violation.applicableRules.map((rule, idx) => (
                            <li key={idx}>{rule}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Source Course
                          </Label>
                          <div className="text-sm mt-1">
                            <div className="font-medium">
                              {violation.sourceCourse.code}:{" "}
                              {violation.sourceCourse.title}
                            </div>
                            <div className="text-muted-foreground">
                              {violation.sourceCourse.credits} credits • Grade:{" "}
                              {violation.sourceCourse.grade}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Target Course
                          </Label>
                          <div className="text-sm mt-1">
                            <div className="font-medium">
                              {violation.targetCourse.code}:{" "}
                              {violation.targetCourse.title}
                            </div>
                            <div className="text-muted-foreground">
                              {violation.targetCourse.credits} credits
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Auto-Decision
                        </Label>
                        <div className="mt-1 flex items-center gap-2">
                          {violation.autoDecision === "approve" ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600 dark:text-green-500">
                                Approve
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600 dark:text-red-500">
                                Reject
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="default">
                          <Check className="h-4 w-4 mr-1" />
                          Approve This Course
                        </Button>
                        <Button size="sm" variant="destructive">
                          <X className="h-4 w-4 mr-1" />
                          Reject This Course
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Actions</CardTitle>
              <CardDescription>
                Make final decision on this evaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg">
                <Check className="h-5 w-5 mr-2" />
                Approve Evaluation
              </Button>
              <Button className="w-full" variant="outline" size="lg">
                <X className="h-5 w-5 mr-2" />
                Reject Evaluation
              </Button>
              <Button className="w-full" variant="ghost">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Return to Queue
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Override History</CardTitle>
              <CardDescription>
                View past manual overrides for this evaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockOverrideHistory.map((override) => (
                <div
                  key={override.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {override.overriddenBy}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(override.overriddenAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {override.reason}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-500 rounded">
                      {override.previousDecision}
                    </span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-500 rounded">
                      {override.newDecision}
                    </span>
                  </div>
                </div>
              ))}

              {mockOverrideHistory.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No override history
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evaluation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Credits</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Eligible Credits</span>
                <span className="font-medium text-green-600 dark:text-green-500">
                  38
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Flagged Credits</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-500">
                  7
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Violations</span>
                <span className="font-medium text-red-600 dark:text-red-500">
                  {violations.length}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-sm font-medium">
                <span>Transfer Eligibility</span>
                <span className="text-green-600 dark:text-green-500">84%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showOverrideModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-6 w-6 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold">Override Violation</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Provide justification for manually overriding this violation
                  decision. This action will be logged for audit purposes.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="override-reason">
                Justification <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="override-reason"
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Explain why this violation should be overridden..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              This override will be logged in the audit trail with your user ID
              and timestamp.
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowOverrideModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleOverride}
                disabled={!overrideReason.trim()}
              >
                Apply Override
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
