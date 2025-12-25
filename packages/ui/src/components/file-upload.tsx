"use client";

import * as React from "react";
import { Upload, X, FileIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Progress } from "./progress";

export interface FileUploadProps {
  value?: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
  label?: string;
  required?: boolean;
  ariaLabel?: string;
  onFileError?: (error: string, file: File) => void;
}

interface FileWithError {
  file: File;
  error?: string;
}

export function FileUpload({
  value = [],
  onChange,
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024,
  maxFiles = 10,
  disabled = false,
  className,
  id,
  label,
  required,
  ariaLabel,
  onFileError,
}: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<
    Record<string, number>
  >({});
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [filesWithErrors, setFilesWithErrors] = React.useState<FileWithError[]>(
    [],
  );

  const inputId = id || `file-upload-${React.useId()}`;

  const validateFile = (file: File): string | null => {
    if (
      accept &&
      !accept.split(",").some((type) => {
        const [typeMain, typeSub] = type.trim().split("/");
        if (typeMain === "*") return true;
        if (typeSub === "*") return file.type.startsWith(typeMain + "/");
        return file.type === type.trim();
      })
    ) {
      return `File type ${file.type} is not accepted`;
    }

    if (file.size > maxSize) {
      return `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`;
    }

    return null;
  };

  const processFiles = (files: FileList) => {
    const newFiles: File[] = [];
    const newFilesWithErrors: FileWithError[] = [...filesWithErrors];

    for (const file of Array.from(files)) {
      const error = validateFile(file);
      if (error) {
        newFilesWithErrors.push({ file, error });
        onFileError?.(error, file);
      } else {
        newFiles.push(file);
      }
    }

    setFilesWithErrors(newFilesWithErrors);

    if (newFiles.length > 0) {
      const totalFiles = [...value, ...newFiles];
      if (totalFiles.length > maxFiles) {
        onFileError?.(
          `Cannot upload more than ${maxFiles} files`,
          newFiles[0]!,
        );
        onChange(totalFiles.slice(0, maxFiles));
      } else {
        onChange(totalFiles);
      }

      newFiles.forEach((file) => {
        simulateUpload(file.name);
      });
    }
  };

  const simulateUpload = (fileName: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress((prev) => ({
        ...prev,
        [fileName]: progress,
      }));

      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 100);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemove = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  const handleRemoveError = (index: number) => {
    const newFilesWithErrors = [...filesWithErrors];
    newFilesWithErrors.splice(index, 1);
    setFilesWithErrors(newFilesWithErrors);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center",
          "rounded-lg border-2 border-dashed",
          "transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-input",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label={ariaLabel || label}
        />
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Upload
            className={cn(
              "w-10 h-10 mb-2",
              dragActive ? "text-primary" : "text-muted-foreground",
            )}
          />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Click to upload</span>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {accept && `Accepts: ${accept}`}
            {accept && maxSize && " • "}
            {maxSize && `Max size: ${Math.round(maxSize / (1024 * 1024))}MB`}
          </p>
        </div>
      </div>

      {(value.length > 0 || filesWithErrors.length > 0) && (
        <div className="mt-4 space-y-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 rounded-md border bg-card"
            >
              <FileIcon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
                {uploadProgress[file.name] !== undefined &&
                  uploadProgress[file.name]! < 100 && (
                    <Progress
                      value={uploadProgress[file.name]!}
                      className="h-1 mt-1"
                    />
                  )}
                {uploadProgress[file.name] === 100 && (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Uploaded
                  </div>
                )}
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          {filesWithErrors.map((item, index) => (
            <div
              key={`error-${item.file.name}-${index}`}
              className="flex items-center gap-3 p-3 rounded-md border bg-destructive/10 border-destructive/20"
            >
              <AlertCircle className="w-4 h-4 text-destructive" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                <p className="text-xs text-destructive">{item.error}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveError(index)}
                aria-label={`Dismiss error for ${item.file.name}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
