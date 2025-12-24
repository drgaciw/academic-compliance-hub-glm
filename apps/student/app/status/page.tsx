"use client";

import Link from "next/link";
import { Button } from "@aah/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aah/ui";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Bell,
} from "lucide-react";

interface EvaluationStatus {
  id: string;
  evaluationType: string;
  submittedDate: string;
  status: "complete" | "in-progress" | "pending";
  progress?: number;
  estimatedCompletion?: string;
}

interface CourseEvaluation {
  code: string;
  name: string;
  category: string;
  status: "approved" | "pending" | "review" | "not-satisfied";
  notes?: string;
}

const mockEvaluations: EvaluationStatus[] = [
  {
    id: "1",
    evaluationType: "Initial Eligibility Assessment",
    submittedDate: "2024-12-15",
    status: "complete",
    progress: 100,
  },
  {
    id: "2",
    evaluationType: "Transfer Credit Review",
    submittedDate: "2024-12-18",
    status: "in-progress",
    progress: 60,
    estimatedCompletion: "2024-12-26",
  },
];

const mockCourses: CourseEvaluation[] = [
  {
    code: "ENGL 101",
    name: "English Composition",
    category: "English",
    status: "approved",
  },
  {
    code: "ENGL 102",
    name: "English Composition II",
    category: "English",
    status: "approved",
  },
  {
    code: "MATH 101",
    name: "College Algebra",
    category: "Mathematics",
    status: "approved",
  },
  {
    code: "MATH 201",
    name: "Statistics",
    category: "Mathematics",
    status: "review",
    notes: "Requires syllabus review",
  },
  {
    code: "HIST 101",
    name: "World History I",
    category: "Social Science",
    status: "approved",
  },
  {
    code: "SCIE 101",
    name: "General Biology",
    category: "Natural Science",
    status: "approved",
  },
  {
    code: "SCIE 102",
    name: "General Chemistry",
    category: "Natural Science",
    status: "pending",
  },
  {
    code: "ARTS 101",
    name: "Introduction to Art",
    category: "Fine Arts",
    status: "approved",
  },
];

export default function StatusPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            <CheckCircle className="h-3 w-3" aria-hidden="true" />
            Complete
          </span>
        );
      case "in-progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            <Clock className="h-3 w-3" aria-hidden="true" />
            In Progress
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const getCourseBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            <CheckCircle className="h-3 w-3" aria-hidden="true" />
            Approved
          </span>
        );
      case "review":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            Under Review
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Pending
          </span>
        );
      case "not-satisfied":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            Not Satisfied
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Status Tracking
          </h1>
          <p className="mt-2 text-gray-600">
            Track your evaluation progress and eligibility status
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Recent updates about your evaluations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 rounded-md border p-3 bg-green-50">
                  <CheckCircle
                    className="mt-0.5 h-5 w-5 text-green-600 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Initial Assessment Complete
                    </p>
                    <p className="text-xs text-green-700">
                      Your eligibility assessment has been completed. View
                      results below.
                    </p>
                    <time
                      className="text-xs text-green-600"
                      dateTime="2024-12-20"
                    >
                      December 20, 2024
                    </time>
                  </div>
                </div>

                <div className="flex gap-3 rounded-md border p-3 bg-blue-50">
                  <Clock
                    className="mt-0.5 h-5 w-5 text-blue-600 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Transfer Review In Progress
                    </p>
                    <p className="text-xs text-blue-700">
                      Your transfer credit review is 60% complete. Expected
                      completion by December 26.
                    </p>
                    <time
                      className="text-xs text-blue-600"
                      dateTime="2024-12-22"
                    >
                      December 22, 2024
                    </time>
                  </div>
                </div>

                <div className="flex gap-3 rounded-md border p-3 bg-yellow-50">
                  <AlertTriangle
                    className="mt-0.5 h-5 w-5 text-yellow-600 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Additional Information Needed
                    </p>
                    <p className="text-xs text-yellow-700">
                      Please upload syllabus for MATH 201 to complete
                      evaluation.
                    </p>
                    <time
                      className="text-xs text-yellow-600"
                      dateTime="2024-12-21"
                    >
                      December 21, 2024
                    </time>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall Eligibility</CardTitle>
                <CardDescription>
                  Your current NCAA eligibility status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="mb-3 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle
                      className="h-12 w-12 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-2xl font-bold text-green-900">Eligible</p>
                  <p className="text-sm text-green-700">
                    You meet NCAA core course requirements
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Core Courses</span>
                    <span className="font-medium text-gray-900">
                      8/16 Required
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 w-1/2 rounded-full bg-green-600"
                      role="progressbar"
                      aria-valuenow={50}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    8 additional core courses needed for full eligibility
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Progress</CardTitle>
                <CardDescription>Track your recent evaluations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="rounded-md border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {evaluation.evaluationType}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Submitted on{" "}
                          {new Date(
                            evaluation.submittedDate,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(evaluation.status)}
                    </div>

                    {evaluation.status === "in-progress" && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">
                            {evaluation.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-600 transition-all"
                            style={{ width: `${evaluation.progress}%` }}
                            role="progressbar"
                            aria-valuenow={evaluation.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        {evaluation.estimatedCompletion && (
                          <p className="mt-1 text-xs text-gray-500">
                            Estimated completion:{" "}
                            {new Date(
                              evaluation.estimatedCompletion,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Evaluation Status</CardTitle>
                <CardDescription>
                  View which courses satisfy NCAA requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="overflow-x-auto"
                  role="region"
                  aria-label="Course evaluation status"
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left font-semibold">
                          Course Code
                        </th>
                        <th className="px-3 py-2 text-left font-semibold">
                          Course Name
                        </th>
                        <th className="px-3 py-2 text-left font-semibold">
                          Category
                        </th>
                        <th className="px-3 py-2 text-left font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCourses.map((course, index) => (
                        <tr
                          key={course.code}
                          className={index % 2 === 0 ? "bg-gray-50" : ""}
                        >
                          <td className="px-3 py-2">{course.code}</td>
                          <td className="px-3 py-2">{course.name}</td>
                          <td className="px-3 py-2">{course.category}</td>
                          <td className="px-3 py-2">
                            {getCourseBadge(course.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mockCourses.filter((c) => c.notes).length > 0 && (
                  <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Notes</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {mockCourses
                        .filter((c) => c.notes)
                        .map((course) => (
                          <li key={course.code}>
                            <strong>{course.code}:</strong> {course.notes}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
