"use client";

import { FileUpload } from "@aah/ui";
import { AlertCircle, Info } from "lucide-react";
import { cn } from "@aah/ui";

export interface DocumentAttachmentStepProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  className?: string;
}

export function DocumentAttachmentStep({
  files,
  onFilesChange,
  className,
}: DocumentAttachmentStepProps) {
  const allowedFileTypes = "application/pdf,image/jpeg,image/png";
  const maxFileSize = 10 * 1024 * 1024;
  const maxFiles = 5;

  const handleFileError = (error: string, file: File) => {
    console.error(`File upload error for ${file.name}:`, error);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-900">
              Document Requirements
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Official transcripts from all institutions attended</li>
              <li>• Accepted formats: PDF, JPEG, PNG</li>
              <li>• Maximum file size: 10MB per file</li>
              <li>• Maximum files: 5 documents</li>
              <li>• Documents must be clear and readable</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-900">
              Important Note
            </h4>
            <p className="text-sm text-yellow-800">
              Please ensure all documents are officially issued by your
              institution. Unofficial documents may delay processing.
            </p>
          </div>
        </div>
      </div>

      <FileUpload
        value={files}
        onChange={onFilesChange}
        accept={allowedFileTypes}
        maxSize={maxFileSize}
        maxFiles={maxFiles}
        multiple
        label="Upload Documents"
        onFileError={handleFileError}
        ariaLabel="Upload your transcript and other required documents"
      />

      <div className="text-xs text-gray-500">
        <p>Supported file types: PDF, JPEG, PNG</p>
        <p>Maximum size: 10MB per file • Maximum files: 5</p>
      </div>
    </div>
  );
}
