import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@aah/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aah/ui";
import {
  FileText,
  ClipboardCheck,
  Upload,
  FolderOpen,
  LayoutDashboard,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Student Portal - Athletic Academics Hub",
  description:
    "Manage your NCAA eligibility and transfer credits through our student portal",
  openGraph: {
    type: "website",
    url: "/student",
    title: "Student Portal - Athletic Academics Hub",
    description:
      "Manage your NCAA eligibility and transfer credits through our student portal",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Student Portal
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your NCAA eligibility and transfer credits
          </p>
        </header>

        <nav className="mb-8 flex flex-wrap gap-2" aria-label="Main navigation">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/preliminary">
              <ClipboardCheck className="mr-2 h-4 w-4" aria-hidden="true" />
              Preliminary Assessment
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/status">
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              Check Status
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
              Upload Documents
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/transcripts">
              <FolderOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              My Transcripts
            </Link>
          </Button>
        </nav>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>
                View your personalized dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Access your student dashboard to view GPA, compliance status,
                and manage your profile with interactive widgets.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preliminary Assessment</CardTitle>
              <CardDescription>
                Check your NCAA eligibility before applying
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Upload your unofficial transcript to see which courses satisfy
                NCAA core requirements and understand your transfer options.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Tracking</CardTitle>
              <CardDescription>Track your evaluation progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View your eligibility determination status, see which courses
                satisfy requirements, and get notified of updates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>
                Submit your unofficial transcript
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Upload your transcript for preliminary assessment. This
                self-service tool helps you understand your options.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Transcripts</CardTitle>
              <CardDescription>View your evaluation history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Access all uploaded transcripts, track evaluation history, and
                download previous results.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
