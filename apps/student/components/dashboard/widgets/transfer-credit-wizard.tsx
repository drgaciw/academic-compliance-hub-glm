"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Save } from "lucide-react";
import { Button } from "@aah/ui";
import { MultiStepWizard } from "./multi-step-wizard";
import { InstitutionSearch, type Institution } from "./institution-search";
import { DocumentAttachmentStep } from "./document-attachment-step";
import { CourseEquivalencyPreview } from "./course-equivalency-preview";
import { FileUploadWithValidation } from "./file-upload-with-validation";
import { SubmitTransferCreditAction } from "./submit-transfer-credit-action";
import {
  useDraftSubmission,
  DraftSaveIndicator,
  type TransferCreditSubmission,
} from "../../../hooks/use-draft-submission";
import { cn } from "@aah/ui";

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
];

export function TransferCreditWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submission, setSubmission] = useState<TransferCreditSubmission>({
    institutionId: "",
    startDate: "",
    endDate: "",
    documents: [],
    notes: "",
  });

  const { loadDraft, saveDraft, clearDraft, isSaving, lastSaved } =
    useDraftSubmission({
      storageKey: "transfer-credit-wizard-draft",
    });

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setSubmission(draft);
    }
  }, [loadDraft]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(submission);
    }, 2000);

    return () => clearTimeout(timer);
  }, [submission, saveDraft]);

  const handleWizardComplete = () => {
    console.log("Wizard completed:", submission);
  };

  const handleClearDraft = () => {
    clearDraft();
    setSubmission({
      institutionId: "",
      startDate: "",
      endDate: "",
      documents: [],
      notes: "",
    });
  };

  const sampleEquivalencies = [
    {
      id: "1",
      sourceCourse: {
        code: "MATH 101",
        name: "Calculus I",
        credits: 4,
      },
      targetCourse: {
        code: "MATH 101",
        name: "Calculus I",
        credits: 4,
      },
      status: "matched" as const,
    },
    {
      id: "2",
      sourceCourse: {
        code: "ENG 101",
        name: "English Composition",
        credits: 3,
      },
      targetCourse: {
        code: "ENG 101",
        name: "Freshman Composition",
        credits: 3,
      },
      status: "matched" as const,
    },
    {
      id: "3",
      sourceCourse: {
        code: "SCI 101",
        name: "Introduction to Biology",
        credits: 3,
      },
      targetCourse: {
        code: "BIO 101",
        name: "General Biology",
        credits: 3,
      },
      status: "partial" as const,
      notes: "Partial credit - lab component required",
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
            onSelect={(inst) => {
              setSubmission((prev) => ({ ...prev, institutionId: inst.id }));
            }}
            placeholder="Search for your institution..."
          />
          {submission.institutionId && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                Selected:{" "}
                {
                  sampleInstitutions.find(
                    (i) => i.id === submission.institutionId,
                  )?.name
                }
              </p>
            </div>
          )}
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
                value={submission.startDate}
                onChange={(e) =>
                  setSubmission((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
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
                value={submission.endDate}
                onChange={(e) =>
                  setSubmission((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "documents",
      title: "Upload Documents",
      content: (
        <div>
          <p className="mb-4 text-gray-600">
            Upload your transcripts and supporting documents.
          </p>
          <FileUploadWithValidation
            value={submission.documents}
            onChange={(files) =>
              setSubmission((prev) => ({ ...prev, documents: files }))
            }
            label="Transcripts and Documents"
          />
        </div>
      ),
    },
    {
      id: "preview",
      title: "Review Equivalency",
      content: (
        <div>
          <p className="mb-4 text-gray-600">
            Review the course equivalency preview for your transfer.
          </p>
          <CourseEquivalencyPreview equivalencies={sampleEquivalencies} />
        </div>
      ),
    },
    {
      id: "submit",
      title: "Submit",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Submission Summary</h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
              <p>
                <span className="font-medium">Institution:</span>{" "}
                {
                  sampleInstitutions.find(
                    (i) => i.id === submission.institutionId,
                  )?.name
                }
              </p>
              <p>
                <span className="font-medium">Dates:</span>{" "}
                {submission.startDate} to {submission.endDate}
              </p>
              <p>
                <span className="font-medium">Documents:</span>{" "}
                {submission.documents.length} file(s)
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={submission.notes}
              onChange={(e) =>
                setSubmission((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Any additional information..."
            />
          </div>

          <SubmitTransferCreditAction
            submission={submission}
            onSuccess={(result) => {
              console.log("Submission successful:", result);
              clearDraft();
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Transfer Credit Request</h2>
        <div className="flex items-center gap-3">
          <DraftSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearDraft}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            Clear Draft
          </Button>
        </div>
      </div>

      <MultiStepWizard steps={wizardSteps} onComplete={handleWizardComplete} />
    </div>
  );
}
