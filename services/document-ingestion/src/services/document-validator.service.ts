export interface FileValidationRule {
  name: string;
  description: string;
  severity: "error" | "warning" | "info";
  validate: (file: ValidatedFile) => ValidationResult;
}

export interface ValidatedFile {
  fileName: string;
  fileType: string;
  fileSize: number;
  content?: Buffer;
  mimeType?: string;
}

export interface ValidationResult {
  passed: boolean;
  message: string;
  details?: any;
}

export interface FileValidationReport {
  valid: boolean;
  fileName: string;
  fileType: string;
  fileSize: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

export interface ValidationError {
  rule: string;
  message: string;
  severity: "error" | "warning" | "info";
  code?: string;
}

export class DocumentValidator {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
  private static readonly MIN_FILE_SIZE = 1024;
  private static readonly ALLOWED_MIME_TYPES = {
    pdf: [
      "application/pdf",
      "application/x-pdf",
      "application/x-bzpdf",
      "application/x-gzpdf",
    ],
    jpeg: ["image/jpeg", "image/jpg", "image/pjpeg"],
    png: ["image/png", "image/x-png"],
    edi: ["application/edi", "text/plain", "text/edi"],
  };

  private static readonly ALLOWED_EXTENSIONS = {
    pdf: [".pdf"],
    jpeg: [".jpg", ".jpeg", ".jpe"],
    png: [".png"],
    edi: [".edi", ".txt", ".edifact"],
  };

  private static readonly FORBIDDEN_PATTERNS = [
    /\.(exe|bat|cmd|sh|ps1|vbs|js)$/i,
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /eval\s*\(/i,
  ];

  private static readonly PDF_SIGNATURE = /^%PDF-/;
  private static readonly JPEG_SIGNATURE = /^\xff\xd8\xff/;
  private static readonly PNG_SIGNATURE = /^\x89PNG\r\n\x1a\n/;

  static validate(file: ValidatedFile): FileValidationReport {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    const rules = [
      this.validateFileSize,
      this.validateFileType,
      this.validateExtension,
      this.validateFileName,
      this.validateContentSignatures,
      this.validateForbiddenPatterns,
    ];

    rules.forEach((rule) => {
      const result = rule(file);
      if (!result.passed) {
        if (result.details?.severity === "error") {
          errors.push({
            rule: result.details.name || "unknown",
            message: result.message,
            severity: "error",
            code: result.details?.code,
          });
        } else if (result.details?.severity === "warning") {
          warnings.push({
            rule: result.details.name || "unknown",
            message: result.message,
            severity: "warning",
            code: result.details?.code,
          });
        } else {
          info.push({
            rule: result.details.name || "unknown",
            message: result.message,
            severity: "info",
            code: result.details?.code,
          });
        }
      }
    });

    return {
      valid: errors.length === 0,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSize,
      errors,
      warnings,
      info,
    };
  }

  private static validateFileSize(file: ValidatedFile): ValidationResult {
    if (file.fileSize > this.MAX_FILE_SIZE) {
      return {
        passed: false,
        message: `File size (${(file.fileSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (10MB)`,
        details: {
          name: "FileSize",
          description: "Validates that file size is within acceptable limits",
          severity: "error" as const,
          code: "FILE_TOO_LARGE",
        },
      };
    }

    if (file.fileSize < this.MIN_FILE_SIZE) {
      return {
        passed: false,
        message: `File size (${file.fileSize} bytes) is below minimum size (1KB). File may be empty.`,
        details: {
          name: "FileSize",
          description: "Validates that file size is above minimum threshold",
          severity: "warning" as const,
          code: "FILE_TOO_SMALL",
        },
      };
    }

    return {
      passed: true,
      message: `File size is valid (${(file.fileSize / 1024).toFixed(2)}KB)`,
      details: {
        name: "FileSize",
        severity: "info" as const,
      },
    };
  }

  private static validateFileType(file: ValidatedFile): ValidationResult {
    const fileType = file.fileType
      .toLowerCase()
      .replace("image/", "")
      .replace("application/", "");

    if (!Object.keys(this.ALLOWED_MIME_TYPES).includes(fileType)) {
      return {
        passed: false,
        message: `Invalid file type: ${file.fileType}. Allowed types: ${Object.keys(this.ALLOWED_MIME_TYPES).join(", ")}`,
        details: {
          name: "FileType",
          description: "Validates that file MIME type is supported",
          severity: "error" as const,
          code: "INVALID_MIME_TYPE",
        },
      };
    }

    if (file.mimeType) {
      const allowedMimes =
        this.ALLOWED_MIME_TYPES[
          fileType as keyof typeof this.ALLOWED_MIME_TYPES
        ];
      if (!allowedMimes.includes(file.mimeType)) {
        return {
          passed: false,
          message: `MIME type mismatch. Declared: ${file.fileType}, Actual: ${file.mimeType}`,
          details: {
            name: "FileType",
            severity: "warning" as const,
            code: "MIME_TYPE_MISMATCH",
          },
        };
      }
    }

    return {
      passed: true,
      message: `File type ${file.fileType} is valid`,
      details: {
        name: "FileType",
        severity: "info" as const,
      },
    };
  }

  private static validateExtension(file: ValidatedFile): ValidationResult {
    const extension = file.fileName
      .slice(file.fileName.lastIndexOf("."))
      .toLowerCase();
    const fileType = file.fileType
      .toLowerCase()
      .replace("image/", "")
      .replace("application/", "");

    const allowedExtensions =
      this.ALLOWED_EXTENSIONS[fileType as keyof typeof this.ALLOWED_EXTENSIONS];

    if (!allowedExtensions) {
      return {
        passed: false,
        message: `Cannot validate extension for file type: ${file.fileType}`,
        details: {
          name: "FileExtension",
          severity: "error" as const,
          code: "UNKNOWN_FILE_TYPE",
        },
      };
    }

    if (!allowedExtensions.includes(extension)) {
      return {
        passed: false,
        message: `File extension ${extension} does not match file type ${file.fileType}. Expected: ${allowedExtensions.join(", ")}`,
        details: {
          name: "FileExtension",
          description:
            "Validates that file extension matches declared file type",
          severity: "error" as const,
          code: "EXTENSION_MISMATCH",
        },
      };
    }

    return {
      passed: true,
      message: `File extension ${extension} matches file type ${file.fileType}`,
      details: {
        name: "FileExtension",
        severity: "info" as const,
      },
    };
  }

  private static validateFileName(file: ValidatedFile): ValidationResult {
    const fileName = file.fileName.trim();

    if (fileName.length === 0) {
      return {
        passed: false,
        message: "File name is empty",
        details: {
          name: "FileName",
          description: "Validates that file name is not empty",
          severity: "error" as const,
          code: "EMPTY_FILENAME",
        },
      };
    }

    if (fileName.length > 255) {
      return {
        passed: false,
        message: "File name exceeds maximum length of 255 characters",
        details: {
          name: "FileName",
          severity: "error" as const,
          code: "FILENAME_TOO_LONG",
        },
      };
    }

    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(fileName)) {
      return {
        passed: false,
        message:
          'File name contains invalid characters: < > : " | ? * or control characters',
        details: {
          name: "FileName",
          severity: "error" as const,
          code: "INVALID_FILENAME_CHARS",
        },
      };
    }

    const reservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
    if (reservedNames.test(fileName.split(".")[0])) {
      return {
        passed: false,
        message: "File name is a reserved system name",
        details: {
          name: "FileName",
          severity: "error" as const,
          code: "RESERVED_FILENAME",
        },
      };
    }

    return {
      passed: true,
      message: "File name is valid",
      details: {
        name: "FileName",
        severity: "info" as const,
      },
    };
  }

  private static validateContentSignatures(
    file: ValidatedFile,
  ): ValidationResult {
    if (!file.content || file.content.length === 0) {
      return {
        passed: true,
        message: "Content signature validation skipped (no content provided)",
        details: {
          name: "ContentSignature",
          severity: "info" as const,
        },
      };
    }

    const fileType = file.fileType.toLowerCase();
    const header = file.content.subarray(0, 10);

    if (fileType.includes("pdf")) {
      if (!this.PDF_SIGNATURE.test(header.toString("latin1"))) {
        return {
          passed: false,
          message: "File content does not match PDF signature",
          details: {
            name: "ContentSignature",
            description: "Validates file magic bytes match declared type",
            severity: "error" as const,
            code: "SIGNATURE_MISMATCH",
          },
        };
      }
    } else if (fileType.includes("jpeg")) {
      if (!this.JPEG_SIGNATURE.test(header)) {
        return {
          passed: false,
          message: "File content does not match JPEG signature",
          details: {
            name: "ContentSignature",
            severity: "error" as const,
            code: "SIGNATURE_MISMATCH",
          },
        };
      }
    } else if (fileType.includes("png")) {
      if (!this.PNG_SIGNATURE.test(header)) {
        return {
          passed: false,
          message: "File content does not match PNG signature",
          details: {
            name: "ContentSignature",
            severity: "error" as const,
            code: "SIGNATURE_MISMATCH",
          },
        };
      }
    }

    return {
      passed: true,
      message: "Content signature matches file type",
      details: {
        name: "ContentSignature",
        severity: "info" as const,
      },
    };
  }

  private static validateForbiddenPatterns(
    file: ValidatedFile,
  ): ValidationResult {
    const fileName = file.fileName.toLowerCase();

    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(fileName)) {
        return {
          passed: false,
          message: "File name or extension matches forbidden pattern",
          details: {
            name: "ForbiddenPatterns",
            description:
              "Validates file does not contain potentially dangerous patterns",
            severity: "error" as const,
            code: "FORBIDDEN_PATTERN",
          },
        };
      }
    }

    if (file.content) {
      const contentString = file.content
        .toString("latin1", 0, Math.min(1024, file.content.length))
        .toLowerCase();
      for (const pattern of this.FORBIDDEN_PATTERNS) {
        if (pattern.test(contentString)) {
          return {
            passed: false,
            message: "File content contains potentially dangerous patterns",
            details: {
              name: "ForbiddenPatterns",
              severity: "error" as const,
              code: "DANGEROUS_CONTENT",
            },
          };
        }
      }
    }

    return {
      passed: true,
      message: "No forbidden patterns detected",
      details: {
        name: "ForbiddenPatterns",
        severity: "info" as const,
      },
    };
  }

  static validateTranscriptData(ocrText: string): {
    valid: boolean;
    confidence: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let confidence = 1.0;

    const hasCourseCode = /[A-Z]{2,4}\s*\d{3,4}/.test(ocrText);
    const hasGrade = /[A-D][+-]?|F|P|NP/.test(ocrText);
    const hasGPA = /gpa|grade\s*point/i.test(ocrText);
    const hasCredits = /credit|hour|unit/i.test(ocrText);
    const hasStudentName = /(?:student|name)[:\s]+[A-Z][a-z]+/i.test(ocrText);

    if (!hasCourseCode) {
      issues.push("No course codes detected in transcript");
      confidence -= 0.3;
    }

    if (!hasGrade) {
      issues.push("No grades detected in transcript");
      confidence -= 0.2;
    }

    if (!hasGPA) {
      issues.push("No GPA information detected in transcript");
      confidence -= 0.15;
    }

    if (!hasCredits) {
      issues.push("No credit information detected in transcript");
      confidence -= 0.15;
    }

    if (!hasStudentName) {
      issues.push("No student name detected in transcript");
      confidence -= 0.1;
    }

    return {
      valid: issues.length === 0,
      confidence: Math.max(0, confidence),
      issues,
    };
  }
}
