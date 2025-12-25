import type { Metadata } from "next";
import { DocsLayout } from "./layout";

export const metadata: Metadata = {
  title: "Documentation | Athletic Academics Hub",
  description:
    "Comprehensive documentation for Athletic Academics Hub platform.",
};

export const revalidate = 3600;

export default function DocsPage() {
  const headings = [
    { id: "introduction", text: "Introduction", level: 2 },
    { id: "getting-started", text: "Getting Started", level: 2 },
    { id: "quick-start", text: "Quick Start", level: 3 },
    { id: "installation", text: "Installation", level: 3 },
    { id: "core-concepts", text: "Core Concepts", level: 2 },
    { id: "architecture", text: "Architecture", level: 3 },
    { id: "data-models", text: "Data Models", level: 3 },
  ];

  return (
    <DocsLayout headings={headings}>
      <section id="introduction" className="mb-12">
        <h2 className="scroll-m-20 text-3xl font-bold">Introduction</h2>
        <p className="text-lg leading-7 text-gray-700 dark:text-gray-300">
          Welcome to the Athletic Academics Hub documentation. This platform
          provides comprehensive tools for managing student-athlete academic
          compliance, eligibility tracking, and transfer credit processing.
        </p>
        <div className="mt-6 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
          <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
            Key Features
          </h3>
          <ul className="list-inside list-disc space-y-2 text-blue-800 dark:text-blue-200">
            <li>Real-time eligibility assessment</li>
            <li>Automated compliance rule evaluation</li>
            <li>Transfer credit analysis and processing</li>
            <li>Comprehensive reporting and analytics</li>
            <li>FERPA-compliant document management</li>
          </ul>
        </div>
      </section>

      <section id="getting-started" className="mb-12">
        <h2 className="scroll-m-20 text-3xl font-bold">Getting Started</h2>
        <p className="text-lg leading-7 text-gray-700 dark:text-gray-300">
          Get up and running with Athletic Academics Hub in minutes.
        </p>
      </section>

      <section id="quick-start" className="mb-12">
        <h3 className="scroll-m-20 text-2xl font-bold">Quick Start</h3>
        <p className="mt-4 leading-7 text-gray-700 dark:text-gray-300">
          The quickest way to get started is to use our hosted solution. Simply
          create an account and follow the onboarding wizard to configure your
          institution settings.
        </p>
        <div className="mt-6 rounded-lg border bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
          <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Step-by-Step Guide
          </h4>
          <ol className="list-inside list-decimal space-y-3 text-gray-700 dark:text-gray-300">
            <li>Create your institutional account</li>
            <li>Configure your NCAA division and sport programs</li>
            <li>Import student data from your SIS</li>
            <li>Set up compliance rules and eligibility criteria</li>
            <li>Train your advisors and administrators</li>
            <li>Go live with your student-athletes</li>
          </ol>
        </div>
      </section>

      <section id="installation" className="mb-12">
        <h3 className="scroll-m-20 text-2xl font-bold">Installation</h3>
        <p className="mt-4 leading-7 text-gray-700 dark:text-gray-300">
          For self-hosted deployments, install the platform using our provided
          installation scripts.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
          <code>{`# Clone the repository
git clone https://github.com/your-org/aah.git
cd aah

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env

# Start the development server
pnpm dev`}</code>
        </pre>
      </section>

      <section id="core-concepts" className="mb-12">
        <h2 className="scroll-m-20 text-3xl font-bold">Core Concepts</h2>
        <p className="text-lg leading-7 text-gray-700 dark:text-gray-300">
          Understanding these core concepts will help you make the most of the
          platform.
        </p>
      </section>

      <section id="architecture" className="mb-12">
        <h3 className="scroll-m-20 text-2xl font-bold">Architecture</h3>
        <p className="mt-4 leading-7 text-gray-700 dark:text-gray-300">
          Athletic Academics Hub is built on a modern microservices architecture
          with:
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Next.js</strong> - React framework for frontend applications
          </li>
          <li>
            <strong>Prisma</strong> - Type-safe database ORM
          </li>
          <li>
            <strong>tRPC</strong> - End-to-end type-safe APIs
          </li>
          <li>
            <strong>Vercel</strong> - Cloud deployment and edge functions
          </li>
        </ul>
      </section>

      <section id="data-models" className="mb-12">
        <h3 className="scroll-m-20 text-2xl font-bold">Data Models</h3>
        <p className="mt-4 leading-7 text-gray-700 dark:text-gray-300">
          The platform uses a relational database with these core entities:
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4 dark:border-gray-800">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Student
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Represents student-athlete profiles including academic records,
              demographics, and enrollment status.
            </p>
          </div>
          <div className="rounded-lg border p-4 dark:border-gray-800">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Course
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Course catalog entries with equivalency mappings and credit
              values.
            </p>
          </div>
          <div className="rounded-lg border p-4 dark:border-gray-800">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              ComplianceRecord
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Tracks compliance status, rule evaluations, and audit history.
            </p>
          </div>
          <div className="rounded-lg border p-4 dark:border-gray-800">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              TransferRequest
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manages transfer credit submissions with document attachments and
              workflow status.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
