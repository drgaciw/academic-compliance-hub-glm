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
  FileText,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: "uploaded" | "processing" | "processed";
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "transcript_spring2024.pdf",
      size: 2458000,
      type: "application/pdf",
      uploadedAt: new Date("2024-12-15"),
      status: "processed",
    },
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    setTimeout(() => {
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        status: "uploaded",
      };
      setUploadedFiles([newFile, ...uploadedFiles]);
      setFile(null);
      setIsUploading(false);
    }, 1500);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id));
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
            Document Upload
          </h1>
          <p className="mt-2 text-gray-600">
            Upload your unofficial transcripts for preliminary assessment
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                  Submit your unofficial transcript for evaluation
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
                  <div className="flex items-start gap-3 rounded-md border p-3 bg-blue-50">
                    <FileText
                      className="mt-0.5 h-4 w-4 text-blue-600 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full"
                  aria-busy={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Upload
                        className="mr-2 h-4 w-4 animate-pulse"
                        aria-hidden="true"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                      Upload Transcript
                    </>
                  )}
                </Button>

                <div className="space-y-2 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                  <p className="flex items-start gap-2 text-xs text-yellow-800">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Self-Service Only:</strong> This upload is for
                      preliminary assessment using unofficial transcripts.
                      Official transcript submission requires advisor
                      assistance.
                    </span>
                  </p>
                  <p className="flex items-start gap-2 text-xs text-yellow-800">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Limited Access:</strong> You can only view your
                      own uploaded documents. Contact compliance staff for
                      official submission.
                    </span>
                  </p>
                </div>

                <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                    Upload Guidelines
                  </h3>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li>Use clear, readable scans or digital copies</li>
                    <li>Include all pages of the transcript</li>
                    <li>Ensure your name and ID are visible</li>
                    <li>Current semester grades should be included</li>
                    <li>Maximum file size: 10MB</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preliminary Assessment Results</CardTitle>
                <CardDescription>
                  Results from your uploaded transcripts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center rounded-lg bg-green-50 p-6 border border-green-200 mb-6">
                  <CheckCircle
                    className="mb-3 h-12 w-12 text-green-600"
                    aria-hidden="true"
                  />
                  <p className="text-lg font-semibold text-green-900">
                    Eligible for Preliminary Assessment
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Your transcript meets requirements for NCAA eligibility
                    review
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    Assessment Summary
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-md border p-4">
                      <p className="text-sm text-gray-600">GPA</p>
                      <p className="text-2xl font-bold text-gray-900">3.4</p>
                      <p className="text-xs text-green-600">
                        Above NCAA minimum (2.3)
                      </p>
                    </div>
                    <div className="rounded-md border p-4">
                      <p className="text-sm text-gray-600">Core Courses</p>
                      <p className="text-2xl font-bold text-gray-900">8/16</p>
                      <p className="text-xs text-yellow-600">
                        8 more courses needed
                      </p>
                    </div>
                    <div className="rounded-md border p-4">
                      <p className="text-sm text-gray-600">Graduation Date</p>
                      <p className="text-2xl font-bold text-gray-900">
                        May 2025
                      </p>
                      <p className="text-xs text-gray-500">Projected</p>
                    </div>
                    <div className="rounded-md border p-4">
                      <p className="text-sm text-gray-600">Transfer Credits</p>
                      <p className="text-2xl font-bold text-gray-900">6</p>
                      <p className="text-xs text-blue-600">
                        Potential transfers
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
                <CardDescription>
                  View all your uploaded transcripts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText
                      className="mb-3 h-12 w-12 text-gray-400"
                      aria-hidden="true"
                    />
                    <p className="text-gray-600">No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {uploadedFiles.map((uploadedFile) => (
                      <div
                        key={uploadedFile.id}
                        className="flex items-center justify-between gap-3 rounded-md border p-4"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText
                            className="h-5 w-5 text-blue-600 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              • {uploadedFile.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {uploadedFile.status === "processed" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              <CheckCircle
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                              Processed
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(uploadedFile.id)}
                            aria-label={`Remove ${uploadedFile.name}`}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
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
