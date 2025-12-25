"use client";

import { useState } from "react";
import { FileText, X, Download, Eye } from "lucide-react";
import { Button } from "@aah/ui";
import { Dialog, DialogContent, DialogTitle } from "@aah/ui";
import { cn } from "@aah/ui";

interface DocumentPreviewProps {
  file: File | { name: string; url: string; type: string };
  onRemove?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function DocumentPreview({
  file,
  onRemove,
  onDownload,
  className,
}: DocumentPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const isFile = file instanceof File;

  const fileName = isFile ? file.name : file.name;
  const fileType = isFile ? file.type : file.type;
  const fileUrl = isFile ? URL.createObjectURL(file) : (file as any).url;

  const isImage = fileType.startsWith("image/");
  const isPdf = fileType === "application/pdf";

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-3 rounded-md border p-3",
          className,
        )}
      >
        <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-gray-500">
            {isFile ? formatFileSize(file.size) : "PDF"}
            {isPdf && " • PDF"}
            {isImage && " • Image"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {(isImage || isPdf) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(true)}
              aria-label={`Preview ${fileName}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              aria-label={`Download ${fileName}`}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              aria-label={`Remove ${fileName}`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogTitle className="text-lg font-semibold">
            {fileName}
          </DialogTitle>
          <div className="mt-4">
            {isImage ? (
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-[60vh] object-contain rounded-md"
              />
            ) : isPdf ? (
              <iframe
                src={fileUrl}
                className="w-full h-[60vh] rounded-md border"
                title={fileName}
              />
            ) : (
              <div className="flex items-center justify-center h-[60vh] bg-muted rounded-md">
                <p className="text-muted-foreground">
                  Preview not available for this file type
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
