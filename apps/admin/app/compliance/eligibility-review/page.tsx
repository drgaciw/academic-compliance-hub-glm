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
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aah/ui";
import {
  Search,
  SortAsc,
  Filter,
  Eye,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileText,
  Calendar,
  Building2,
  User,
  MoreVertical,
  Undo,
} from "lucide-react";
import Link from "next/link";

const mockEvaluations = [
  {
    id: "eval-001",
    studentId: "STU001",
    studentName: "John Smith",
    sport: "Football",
    sourceInstitution: "University of Texas",
    targetInstitution: "University of Alabama",
    status: "pending" as const,
    priority: "high" as const,
    submittedDate: "2025-12-20",
    creditCount: 45,
    violations: 2,
  },
  {
    id: "eval-002",
    studentId: "STU002",
    studentName: "Sarah Johnson",
    sport: "Basketball",
    sourceInstitution: "Ohio State University",
    targetInstitution: "University of Michigan",
    status: "pending" as const,
    priority: "medium" as const,
    submittedDate: "2025-12-21",
    creditCount: 32,
    violations: 1,
  },
  {
    id: "eval-003",
    studentId: "STU003",
    studentName: "Michael Brown",
    sport: "Baseball",
    sourceInstitution: "University of Florida",
    targetInstitution: "University of Georgia",
    status: "in_review" as const,
    priority: "low" as const,
    submittedDate: "2025-12-19",
    creditCount: 28,
    violations: 0,
  },
  {
    id: "eval-004",
    studentId: "STU004",
    studentName: "Emily Davis",
    sport: "Soccer",
    sourceInstitution: "University of Oklahoma",
    targetInstitution: "University of Texas",
    status: "pending" as const,
    priority: "high" as const,
    submittedDate: "2025-12-22",
    creditCount: 60,
    violations: 3,
  },
  {
    id: "eval-005",
    studentId: "STU005",
    studentName: "David Wilson",
    sport: "Track & Field",
    sourceInstitution: "University of Southern California",
    targetInstitution: "University of Oregon",
    status: "approved" as const,
    priority: "low" as const,
    submittedDate: "2025-12-15",
    creditCount: 38,
    violations: 0,
  },
];

type StatusFilter = "all" | "pending" | "in_review" | "approved" | "rejected";
type SortField = "date" | "priority" | "student" | "credits";
type SortOrder = "asc" | "desc";

export default function EligibilityReviewPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [institutionFilter, setInstitutionFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredEvaluations = mockEvaluations
    .filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (
        institutionFilter !== "all" &&
        item.sourceInstitution !== institutionFilter &&
        item.targetInstitution !== institutionFilter
      ) {
        return false;
      }
      if (
        searchQuery &&
        !item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.studentId.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison =
            new Date(a.submittedDate).getTime() -
            new Date(b.submittedDate).getTime();
          break;
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "student":
          comparison = a.studentName.localeCompare(b.studentName);
          break;
        case "credits":
          comparison = a.creditCount - b.creditCount;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
      in_review:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
      medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
      low: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          styles[priority as keyof typeof styles] || styles.low
        }`}
      >
        {priority}
      </span>
    );
  };

  const uniqueInstitutions = Array.from(
    new Set(
      mockEvaluations.flatMap((e) => [
        e.sourceInstitution,
        e.targetInstitution,
      ]),
    ),
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Evaluations</h1>
        <p className="text-muted-foreground mt-2">
          Review and process transfer credit eligibility evaluations
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Evaluation Queue</CardTitle>
              <CardDescription>
                {filteredEvaluations.length} evaluation
                {filteredEvaluations.length !== 1 ? "s" : ""} pending review
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v: StatusFilter) => setStatusFilter(v)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={institutionFilter}
              onValueChange={setInstitutionFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by institution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {uniqueInstitutions.map((inst) => (
                  <SelectItem key={inst} value={inst}>
                    {inst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortField}
              onValueChange={(v: SortField) => setSortField(v)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="student">Student Name</SelectItem>
                <SelectItem value="credits">Credit Count</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortAsc className="h-4 w-4 rotate-180" />
              )}
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 text-sm font-medium border-b">
              <div className="col-span-3">Student</div>
              <div className="col-span-2">Institutions</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Credits</div>
              <div className="col-span-2">Priority</div>
              <div className="col-span-1">Actions</div>
            </div>

            {filteredEvaluations.map((evaluation) => (
              <>
                <div
                  key={evaluation.id}
                  className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <div className="col-span-3 space-y-1">
                    <div className="font-medium">{evaluation.studentName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {evaluation.studentId}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {evaluation.sport}
                    </div>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <div className="text-sm flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      {evaluation.sourceInstitution}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      → {evaluation.targetInstitution}
                    </div>
                  </div>

                  <div className="col-span-2">
                    {getStatusBadge(evaluation.status)}
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {evaluation.creditCount}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        credits
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(evaluation.priority)}
                      {evaluation.violations > 0 && (
                        <div className="flex items-center gap-1 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          {evaluation.violations} violation
                          {evaluation.violations !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center gap-2">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link
                        href={`/compliance/eligibility-review/${evaluation.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleRowExpansion(evaluation.id)}
                    >
                      {expandedRows.has(evaluation.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expandedRows.has(evaluation.id) && (
                  <div className="p-4 bg-muted/20 border-b">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">
                          Submitted
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(
                            evaluation.submittedDate,
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">
                          Violations
                        </div>
                        <div>
                          {evaluation.violations === 0 ? (
                            <span className="text-green-600 dark:text-green-500">
                              No violations found
                            </span>
                          ) : (
                            <span className="text-destructive">
                              {evaluation.violations} rule violation
                              {evaluation.violations !== 1 ? "s" : ""} require
                              attention
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={`/compliance/eligibility-review/${evaluation.id}`}
                        >
                          Review Details
                        </Link>
                      </Button>
                      {evaluation.status === "pending" && (
                        <>
                          <Button size="sm" variant="default">
                            <Check className="h-4 w-4 mr-1" />
                            Quick Approve
                          </Button>
                          <Button size="sm" variant="destructive">
                            <X className="h-4 w-4 mr-1" />
                            Quick Reject
                          </Button>
                        </>
                      )}
                      {evaluation.status === "in_review" && (
                        <Button size="sm" variant="outline">
                          <Undo className="h-4 w-4 mr-1" />
                          Return to Pending
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ))}

            {filteredEvaluations.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                No evaluations match the current filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
