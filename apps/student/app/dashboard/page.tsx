"use client";

import { useState, useEffect } from "react";
import {
  DashboardLayout,
  DashboardHeader,
  WidgetGrid,
} from "../../components/dashboard/dashboard-layout";
import { DashboardWidgets } from "../../components/dashboard/widgets/dashboard-widgets";
import { DashboardSkeleton } from "../../components/dashboard/skeleton-loading";
import { DashboardDragDrop } from "../../components/dashboard/dashboard-dragdrop";
import { MultiStepWizard } from "../../components/dashboard/widgets/multi-step-wizard";
import {
  InstitutionSearch,
  type Institution,
} from "../../components/dashboard/widgets/institution-search";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const sampleInstitutions: Institution[] = [
    {
      id: "1",
      name: "University of Texas at Austin",
      city: "Austin",
      state: "TX",
      country: "USA",
    },
    {
      id: "2",
      name: "Texas A&M University",
      city: "College Station",
      state: "TX",
      country: "USA",
    },
    {
      id: "3",
      name: "University of Florida",
      city: "Gainesville",
      state: "FL",
      country: "USA",
    },
    {
      id: "4",
      name: "Florida State University",
      city: "Tallahassee",
      state: "FL",
      country: "USA",
    },
    {
      id: "5",
      name: "University of Michigan",
      city: "Ann Arbor",
      state: "MI",
      country: "USA",
    },
    {
      id: "6",
      name: "University of Alabama",
      city: "Tuscaloosa",
      state: "AL",
      country: "USA",
    },
  ];

  const wizardSteps = [
    {
      id: "institution",
      title: "Select Institution",
      content: (
        <div>
          <p className="mb-4 text-gray-600">
            Search and select the institution you attended.
          </p>
          <InstitutionSearch
            institutions={sampleInstitutions}
            onSelect={(inst) => console.log("Selected:", inst)}
            placeholder="Search for your institution..."
          />
        </div>
      ),
    },
    {
      id: "dates",
      title: "Attendance Dates",
      content: (
        <div>
          <p className="mb-4 text-gray-600">
            Enter your attendance dates at this institution.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="start-date"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <input
                id="start-date"
                type="month"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <input
                id="end-date"
                type="month"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "review",
      title: "Review & Submit",
      content: (
        <div>
          <p className="mb-4 text-gray-600">
            Review your information before submitting.
          </p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Institution summary and dates will be displayed here.
            </p>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader
          title="Dashboard"
          description="Loading your personalized dashboard..."
        />
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (showWizard) {
    return (
      <DashboardLayout>
        <DashboardHeader
          title="Add Institution"
          description="Complete the wizard to add your institution information"
        />
        <MultiStepWizard
          steps={wizardSteps}
          onComplete={() => {
            setShowWizard(false);
          }}
        />
      </DashboardLayout>
    );
  }

  const defaultWidgets = [
    { id: "1", component: <DashboardWidgets /> },
    { id: "2", component: <DashboardWidgets /> },
    { id: "3", component: <DashboardWidgets /> },
  ];

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Student Dashboard"
        description="View your academic progress, compliance status, and manage your profile"
      />

      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setShowWizard(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Institution
        </button>
      </div>

      <DashboardDragDrop widgets={defaultWidgets} onWidgetsChange={() => {}} />
    </DashboardLayout>
  );
}
