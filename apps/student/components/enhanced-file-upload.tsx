"use client";

import { useState } from "react";
import { FileUpload } from "@aah/ui";
import { UploadProgressIndicator } from "../upload-progress-indicator";
import { DocumentPreview } from "../document-preview";

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

export function EnhancedFileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);

    newFiles.forEach((file) => {
      const progressId = crypto.randomUUID();
      setUploadProgress((prev) => [
        ...prev,
        {
          fileName: file.name,
          progress: 0,
          status: "uploading",
        },
      ]);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress((prev) =>
          prev.map((p) => (p.fileName === file.name ? { ...p, progress } : p)),
        );

        if (progress >= 100) {
          clearInterval(interval);
          setUploadProgress((prev) =>
            prev.map((p) =>
              p.fileName === file.name
                ? { ...p, status: "completed" as any, progress: 100 }
                : p,
            ),
          );

          setTimeout(() => {
            setUploadProgress((prev) =>
              prev.filter((p) => p.fileName !== file.name),
            );
          }, 3000);
        }
      }, 200);
    });
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleDownload = () => {
    console.log("Download file");
  };

  return (
    <div className="space-y-6">
      <FileUpload
        value={files}
        onChange={handleFileChange}
        accept="application/pdf,image/jpeg,image/png"
        maxSize={10 * 1024 * 1024}
        maxFiles={5}
        multiple
        label="Upload Documents"
      />

      <UploadProgressIndicator uploads={uploadProgress} />

      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Uploaded Files</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <DocumentPreview
                key={index}
                file={file}
                onRemove={() => handleRemoveFile(index)}
                onDownload={handleDownload}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
