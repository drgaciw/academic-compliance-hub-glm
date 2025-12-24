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
  Download,
  FileText,
  CheckCircle,
  Clock,
  ArrowLeft,
  Calendar,
} from "lucide-react";

interface Transcript {
  id: string;
  name: string;
  uploadedAt: Date;
  type: "official" | "unofficial";
  evaluationDate?: Date;
  status: "completed" | "in-progress" | "pending";
  coursesEvaluated: number;
  gpa: number;
}

interface EvaluationHistory {
  id: string;
  evaluationDate: Date;
  evaluationType: string;
  result: "eligible" | "not-eligible" | "pending";
  notes: string;
}

const mockTranscripts: Transcript[] = [
  {
    id: "1",
    name: "transcript_fall2024.pdf",
    uploadedAt: new Date("2024-12-15"),
    type: "unofficial",
    evaluationDate: new Date("2024-12-20"),
    status: "completed",
    coursesEvaluated: 8,
    gpa: 3.4,
  },
  {
    id: "2",
    name: "transcript_spring2024.pdf",
    uploadedAt: new Date("2024-06-10"),
    type: "unofficial",
    evaluationDate: new Date("2024-06-15"),
    status: "completed",
    coursesEvaluated: 6,
    gpa: 3.2,
  },
  {
    id: "3",
    name: "transcript_current.pdf",
    uploadedAt: new Date("2024-12-22"),
    type: "unofficial",
    status: "in-progress",
    coursesEvaluated: 0,
    gpa: 0,
  },
];

const mockHistory: EvaluationHistory[] = [
  {
    id: "1",
    evaluationDate: new Date("2024-12-20"),
    evaluationType: "Initial Eligibility Assessment",
    result: "eligible",
    notes:
      "Meets all NCAA core course requirements. 6 of 8 required courses completed.",
  },
  {
    id: "2",
    evaluationDate: new Date("2024-12-15"),
    evaluationType: "Transfer Credit Review",
    result: "pending",
    notes:
      "Under review by compliance officer. Additional documentation requested for MATH 201.",
  },
  {
    id: "3",
    evaluationDate: new Date("2024-06-15"),
    evaluationType: "Preliminary Assessment",
    result: "eligible",
    notes:
      "Good progress towards eligibility. Continue completing core courses.",
  },
];

export default function TranscriptsPage() {
  const getResultBadge = (result: string) => {
    switch (result) {
      case "eligible":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            <CheckCircle className="h-3 w-3" aria-hidden="true" />
            Eligible
          </span>
        );
      case "not-eligible":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            Not Eligible
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            <CheckCircle className="h-3 w-3" aria-hidden="true" />
            Completed
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
            My Transcripts
          </h1>
          <p className="mt-2 text-gray-600">
            View all uploaded transcripts and evaluation history
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload New</CardTitle>
                <CardDescription>
                  Add a new transcript for evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/upload">
                    <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                    Upload Transcript
                  </Link>
                </Button>
                <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Tip:</strong> Keep your transcripts updated. Upload
                    after each semester to track progress.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  Overview of your transcript history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Total Transcripts
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {mockTranscripts.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Completed Evaluations
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {
                      mockTranscripts.filter((t) => t.status === "completed")
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Reviews</span>
                  <span className="text-lg font-bold text-blue-600">
                    {
                      mockTranscripts.filter((t) => t.status !== "completed")
                        .length
                    }
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cumulative GPA</span>
                  <span className="text-lg font-bold text-green-600">
                    {mockTranscripts.reduce(
                      (acc, t) => acc + (t.gpa > 0 ? t.gpa : 0),
                      0,
                    ) > 0
                      ? (
                          mockTranscripts.reduce(
                            (acc, t) => acc + (t.gpa > 0 ? t.gpa : 0),
                            0,
                          ) / mockTranscripts.filter((t) => t.gpa > 0).length
                        ).toFixed(2)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Courses Evaluated
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {mockTranscripts.reduce(
                      (acc, t) => acc + t.coursesEvaluated,
                      0,
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Contact your advisor for assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">Contact Advisor</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Transcripts</CardTitle>
                <CardDescription>
                  All transcripts you have submitted for evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTranscripts.map((transcript) => (
                    <div key={transcript.id} className="rounded-md border p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText
                            className="mt-0.5 h-5 w-5 text-blue-600 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {transcript.name}
                            </h3>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                                Uploaded:{" "}
                                {transcript.uploadedAt.toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                {transcript.evaluationDate && (
                                  <>
                                    <Calendar
                                      className="h-3 w-3"
                                      aria-hidden="true"
                                    />
                                    Evaluated:{" "}
                                    {transcript.evaluationDate.toLocaleDateString()}
                                  </>
                                )}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {getStatusBadge(transcript.status)}
                              <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium">
                                {transcript.type === "official"
                                  ? "Official"
                                  : "Unofficial"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:items-end">
                          {transcript.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              <Download
                                className="mr-2 h-4 w-4"
                                aria-hidden="true"
                              />
                              Results
                            </Button>
                          )}
                        </div>
                      </div>

                      {transcript.status === "completed" && (
                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-gray-50 p-3">
                          <div>
                            <p className="text-xs text-gray-600">GPA</p>
                            <p className="text-lg font-bold text-gray-900">
                              {transcript.gpa.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">
                              Courses Evaluated
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {transcript.coursesEvaluated}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evaluation History</CardTitle>
                <CardDescription>
                  Track all your evaluation results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockHistory.map((history) => (
                    <div key={history.id} className="rounded-md border p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {history.evaluationType}
                            </h3>
                            {getResultBadge(history.result)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <time
                              dateTime={history.evaluationDate.toISOString()}
                            >
                              {history.evaluationDate.toLocaleDateString()} at{" "}
                              {history.evaluationDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </time>
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3">
                            {history.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
