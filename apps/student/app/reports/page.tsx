"use client";

import { ReportGenerationUI } from "../../components/report-generation-ui";

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <ReportGenerationUI />
      </div>
    </main>
  );
}
