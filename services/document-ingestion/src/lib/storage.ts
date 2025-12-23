import { put } from "@vercel/blob";
import type { DocumentType } from "../types";

export interface StorageResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class BlobStorage {
  private static readonly ALLOWED_TYPES: Record<DocumentType, string[]> = {
    pdf: ["application/pdf"],
    jpeg: ["image/jpeg", "image/jpg"],
    png: ["image/png"],
    edi: ["application/edi", "text/plain"],
  };

  static async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    fileType: DocumentType,
  ): Promise<StorageResult> {
    try {
      const allowedMimeTypes = this.ALLOWED_TYPES[fileType];
      const mimeType = allowedMimeTypes[0];

      const uniqueFileName = `${Date.now()}-${fileName}`;

      const blob = await put(uniqueFileName, fileBuffer, {
        access: "public",
        contentType: mimeType,
      });

      return {
        success: true,
        url: blob.url,
      };
    } catch (error) {
      console.error("Storage upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload file",
      };
    }
  }

  private static getExtension(fileType: DocumentType): string {
    const extensions: Record<DocumentType, string> = {
      pdf: "pdf",
      jpeg: "jpg",
      png: "png",
      edi: "edi",
    };
    return extensions[fileType];
  }
}
