"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@aah/ui";
import { cn } from "@aah/ui";
import type { TransferCreditSubmission } from "../hooks/use-draft-submission";

interface SubmitTransferCreditActionProps {
  submission: TransferCreditSubmission;
  onSuccess?: (result: { id: string; status: string }) => void;
  onError?: (error: string) => void;
  className?: string;
}

export async function submitTransferCredit(
  submission: TransferCreditSubmission,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const formData = new FormData();

    formData.append("institutionId", submission.institutionId);
    formData.append("startDate", submission.startDate);
    formData.append("endDate", submission.endDate);
    if (submission.notes) {
      formData.append("notes", submission.notes);
    }

    submission.documents.forEach((file) => {
      formData.append("documents", file);
    });

    const response = await fetch("/api/transfer-credits/submit", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Submission failed");
    }

    const result = await response.json();
    return { success: true, id: result.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function SubmitTransferCreditAction({
  submission,
  onSuccess,
  onError,
  className,
}: SubmitTransferCreditActionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (
      !submission.institutionId ||
      !submission.startDate ||
      !submission.endDate
    ) {
      setStatus("error");
      setMessage("Please fill in all required fields");
      onError?.("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setMessage("");

    const result = await submitTransferCredit(submission);

    setIsSubmitting(false);

    if (result.success) {
      setStatus("success");
      setMessage("Submission submitted successfully!");
      onSuccess?.({ id: result.id!, status: "submitted" });
    } else {
      setStatus("error");
      setMessage(result.error || "Submission failed");
      onError?.(result.error || "Submission failed");
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Transfer Credit Request"
        )}
      </Button>

      {status === "success" && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">{message}</p>
            <p className="text-xs text-green-700 mt-1">
              You will receive a confirmation email shortly.
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
