import type { FileValidationResult, DocumentType } from "../types";

const ALLOWED_MIME_TYPES: Record<string, DocumentType> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpeg",
  "image/jpg": "jpeg",
  "image/png": "png",
  "application/edi": "edi",
  "application/edifact": "edi",
  "text/edi": "edi",
};

const ALLOWED_EXTENSIONS: Record<string, DocumentType> = {
  pdf: "pdf",
  jpg: "jpeg",
  jpeg: "jpeg",
  png: "png",
  edi: "edi",
  edifact: "edi",
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export class FileValidator {
  static validateMimeType(mimeType: string): FileValidationResult {
    const fileType = ALLOWED_MIME_TYPES[mimeType.toLowerCase()];

    if (!fileType) {
      return {
        valid: false,
        error: `Invalid file type: ${mimeType}. Allowed types: PDF, JPEG, PNG, EDI`,
      };
    }

    return {
      valid: true,
      fileType,
    };
  }

  static validateFileName(fileName: string): FileValidationResult {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (!extension) {
      return {
        valid: false,
        error: "File name must have an extension",
      };
    }

    const fileType = ALLOWED_EXTENSIONS[extension];

    if (!fileType) {
      return {
        valid: false,
        error: `Invalid file extension: ${extension}. Allowed extensions: pdf, jpg, jpeg, png, edi`,
      };
    }

    return {
      valid: true,
      fileType,
    };
  }

  static validateFileSize(size: number): FileValidationResult {
    if (size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 50MB limit. Current size: ${(size / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    if (size === 0) {
      return {
        valid: false,
        error: "File is empty",
      };
    }

    return { valid: true };
  }

  static validateFile(file: {
    name: string;
    type: string;
    size: number;
  }): FileValidationResult {
    const mimeTypeResult = this.validateMimeType(file.type);
    if (!mimeTypeResult.valid) {
      return mimeTypeResult;
    }

    const fileNameResult = this.validateFileName(file.name);
    if (!fileNameResult.valid) {
      return fileNameResult;
    }

    const fileSizeResult = this.validateFileSize(file.size);
    if (!fileSizeResult.valid) {
      return fileSizeResult;
    }

    return {
      valid: true,
      fileType: mimeTypeResult.fileType,
    };
  }
}
