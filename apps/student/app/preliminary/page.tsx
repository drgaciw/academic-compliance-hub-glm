"use client";

import { useState } from "react";
import Link from "next/link";
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
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowLeft,
} from "lucide-react";

interface CourseRequirement {
  code: string;
  name: string;
  category: string;
  satisfies: boolean;
  equivalent?: string;
}

const mockRequirements: CourseRequirement[] = [
  {
    code: "ENGL 101",
    name: "English Composition",
    category: "English",
    satisfies: true,
    equivalent: "ENG 101",
  },
  {
    code: "ENGL 102",
    name: "English Composition II",
    category: "English",
    satisfies: true,
    equivalent: "ENG 102",
  },
  {
    code: "MATH 101",
    name: "College Algebra",
    category: "Mathematics",
    satisfies: true,
    equivalent: "MAT 101",
  },
  {
    code: "MATH 201",
    name: "Statistics",
    category: "Mathematics",
    satisfies: false,
  },
  {
    code: "HIST 101",
    name: "World History I",
    category: "Social Science",
    satisfies: true,
    equivalent: "HIS 101",
  },
  {
    code: "SCIE 101",
    name: "General Biology",
    category: "Natural Science",
    satisfies: true,
    equivalent: "BIO 101",
  },
  {
    code: "SCIE 102",
    name: "General Chemistry",
    category: "Natural Science",
    satisfies: false,
  },
  {
    code: "ARTS 101",
    name: "Introduction to Art",
    category: "Fine Arts",
    satisfies: true,
    equivalent: "ART 101",
  },
];

export default function PreliminaryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
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
            Preliminary Assessment
          </h1>
          <p className="mt-2 text-gray-600">
            Upload your unofficial transcript to check NCAA eligibility
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Upload Transcript</CardTitle>
                <CardDescription>
                  Submit your unofficial transcript for preliminary evaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transcript-upload">Transcript File</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="transcript-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      aria-describedby="file-help"
                    />
                    <p id="file-help" className="text-xs text-gray-500">
                      Accepted formats: PDF, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                </div>

                {file && (
                  <div className="flex items-center gap-2 rounded-md border p-3 bg-blue-50">
                    <FileText
                      className="h-4 w-4 text-blue-600"
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate text-sm font-medium">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className="w-full"
                  aria-busy={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Upload
                        className="mr-2 h-4 w-4 animate-pulse"
                        aria-hidden="true"
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                      Analyze Transcript
                    </>
                  )}
                </Button>

                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> This is a preliminary assessment
                    based on unofficial transcripts. Final eligibility
                    determination requires official transcript evaluation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>NCAA Core Course Requirements</CardTitle>
                <CardDescription>
                  See which of your courses satisfy NCAA eligibility
                  requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!analysisComplete ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle
                      className="mb-4 h-12 w-12 text-gray-400"
                      aria-hidden="true"
                    />
                    <p className="text-gray-600">
                      Upload your transcript to see which courses satisfy NCAA
                      core requirements
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-4 border border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle
                          className="h-5 w-5 text-green-600"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-semibold text-green-900">
                            6 of 8 Core Requirements Satisfied
                          </p>
                          <p className="text-sm text-green-700">
                            You're on track for NCAA eligibility
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/upload">Upload Official</Link>
                      </Button>
                    </div>

                    <div
                      className="overflow-x-auto"
                      role="region"
                      aria-label="Course requirements"
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
                          {mockRequirements.map((course, index) => (
                            <tr
                              key={course.code}
                              className={index % 2 === 0 ? "bg-gray-50" : ""}
                            >
                              <td className="px-3 py-2">{course.code}</td>
                              <td className="px-3 py-2">{course.name}</td>
                              <td className="px-3 py-2">{course.category}</td>
                              <td className="px-3 py-2">
                                {course.satisfies ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                    <CheckCircle
                                      className="h-3 w-3"
                                      aria-hidden="true"
                                    />
                                    Satisfied
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                    <AlertCircle
                                      className="h-3 w-3"
                                      aria-hidden="true"
                                    />
                                    Not Satisfied
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Transfer Options
                      </h3>
                      <p className="text-sm text-blue-800 mb-2">
                        Based on your preliminary assessment, you may be
                        eligible to transfer the following courses:
                      </p>
                      <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                        <li>ENGL 101 → ENG 101 (Composition)</li>
                        <li>ENGL 102 → ENG 102 (Composition II)</li>
                        <li>MATH 101 → MAT 101 (College Algebra)</li>
                        <li>HIST 101 → HIS 101 (World History)</li>
                        <li>SCIE 101 → BIO 101 (Biology)</li>
                        <li>ARTS 101 → ART 101 (Art)</li>
                      </ul>
                      <p className="text-xs text-blue-700 mt-3">
                        Contact your advisor for complete transfer credit
                        evaluation.
                      </p>
                    </div>
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
