"use client";

import { useState } from "react";
import { FileUpload } from "@aah/ui";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@aah/ui";

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface FileUploadWithValidationProps {
  value: File[];
  onChange: (files: File[]) => void;
  className?: string;
  label?: string;
  maxFiles?: number;
}

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE = 10 * 1024 * 1024;

export function FileUploadWithValidation({
  value,
  onChange,
  className,
  label,
  maxFiles = 5,
}: FileUploadWithValidationProps) {
  const [validationResults, setValidationResults] = useState<
    Record<string, FileValidationResult>
  >({});

  const validateFile = (file: File): FileValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!ALLOWED_TYPES.includes(file.type)) {
      const typeNames = {
        "application/pdf": "PDF",
        "image/jpeg": "JPEG",
        "image/png": "PNG",
      };
      errors.push(
        `Invalid file type. Allowed: ${Object.values(typeNames).join(", ")}`,
      );
    }

    if (file.size > MAX_SIZE) {
      errors.push(
        `File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      warnings.push(
        "Large file detected. Consider compressing for faster upload.",
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  const handleFileChange = (files: File[]) => {
    const newValidationResults: Record<string, FileValidationResult> = {};

    files.forEach((file) => {
      newValidationResults[file.name] = validateFile(file);
    });

    setValidationResults(newValidationResults);

    const validFiles = files.filter((file) => {
      const result = newValidationResults[file.name];
      return result.isValid;
    });

    onChange(validFiles);
  };

  const handleFileError = (error: string, file: File) => {
    console.error(`File validation error: ${file.name}:`, error);
  };

  const hasErrors = Object.values(validationResults).some(
    (r) => r.errors.length > 0,
  );
  const hasWarnings = Object.values(validationResults).some(
    (r) => r.warnings.length > 0,
  );

  return (
    <div className={cn("space-y-4", className)}>
      <FileUpload
        value={value}
        onChange={handleFileChange}
        accept="application/pdf,image/jpeg,image/png"
        maxSize={MAX_SIZE}
        maxFiles={maxFiles}
        multiple
        label={label}
        onFileError={handleFileError}
      />

      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-900">
                Validation Errors
              </h4>
              <ul className="mt-2 space-y-1">
                {Object.entries(validationResults).map(([fileName, result]) =>
                  result.errors.map((error, idx) => (
                    <li
                      key={`${fileName}-${idx}`}
                      className="text-xs text-red-700"
                    >
                      <span className="font-medium">{fileName}:</span> {error}
                    </li>
                  )),
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {hasWarnings && !hasErrors && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900">
                Warnings
              </h4>
              <ul className="mt-2 space-y-1">
                {Object.entries(validationResults).map(([fileName, result]) =>
                  result.warnings.map((warning, idx) => (
                    <li
                      key={`${fileName}-${idx}`}
                      className="text-xs text-yellow-700"
                    >
                      <span className="font-medium">{fileName}:</span> {warning}
                    </li>
                  )),
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!hasErrors && value.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-900">
                Validation Complete
              </h4>
              <p className="text-xs text-green-700 mt-1">
                All files meet the requirements.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>
          <strong>Requirements:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>File types: PDF, JPEG, PNG</li>
          <li>Maximum size: 10MB per file</li>
          <li>Maximum files: {maxFiles}</li>
        </ul>
      </div>
    </div>
  );
}
