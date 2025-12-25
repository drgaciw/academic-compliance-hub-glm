"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@aah/ui";
import { cn } from "@aah/ui";

export interface WizardStep {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface MultiStepWizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  className?: string;
}

export function MultiStepWizard({
  steps,
  onComplete,
  className,
}: MultiStepWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    if (index < currentStep || completedSteps.has(index)) {
      setCurrentStep(index);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-gray-900">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm transition-colors",
                currentStep === index
                  ? "bg-blue-50 font-semibold text-blue-900"
                  : completedSteps.has(index)
                    ? "text-gray-700 hover:bg-gray-50"
                    : "text-gray-500",
              )}
              onClick={() => handleStepClick(index)}
              disabled={!completedSteps.has(index) && index > currentStep}
            >
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  completedSteps.has(index)
                    ? "bg-green-100 text-green-700"
                    : currentStep === index
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600",
                )}
              >
                {completedSteps.has(index) ? "✓" : index + 1}
              </div>
              <span className="truncate">{step.title}</span>
            </button>
          ))}
        </div>

        <div className="md:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {steps[currentStep].title}
            </h2>
            <div className="mb-6">{steps[currentStep].content}</div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back
              </Button>
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? "Complete" : "Next"}
                {currentStep < steps.length - 1 && (
                  <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
