import type {
  DocumentType,
  DocumentCategory,
  TranscriptStructure,
} from "../types";

export interface ClassificationResult {
  category: DocumentCategory;
  isTranscript: boolean;
  transcriptStructure?: TranscriptStructure;
  pageCount?: number;
}

export class DocumentClassifier {
  static async classify(
    fileBuffer: Buffer,
    fileType: DocumentType,
    fileName: string,
  ): Promise<ClassificationResult> {
    let category: DocumentCategory = "other";
    let isTranscript = false;
    let transcriptStructure: TranscriptStructure | undefined;
    let pageCount: number | undefined;

    if (fileType === "pdf") {
      const pdfResult = await this.classifyPDF(fileBuffer, fileName);
      category = pdfResult.category;
      isTranscript = pdfResult.isTranscript;
      transcriptStructure = pdfResult.transcriptStructure;
      pageCount = pdfResult.pageCount;
    } else if (fileType === "jpeg" || fileType === "png") {
      const imageResult = await this.classifyImage(fileBuffer, fileName);
      category = imageResult.category;
      isTranscript = imageResult.isTranscript;
      transcriptStructure = imageResult.transcriptStructure;
    } else if (fileType === "edi") {
      category = "transfer-evaluation";
    }

    return {
      category,
      isTranscript,
      transcriptStructure,
      pageCount,
    };
  }

  private static async classifyPDF(
    buffer: Buffer,
    fileName: string,
  ): Promise<ClassificationResult> {
    const content = buffer.toString("utf-8", 0, Math.min(buffer.length, 5000));
    const pageCount = this.estimatePageCount(buffer, fileName);

    const keywords = {
      transcript: [
        "transcript",
        "academic record",
        "grade report",
        "cumulative gpa",
        "student record",
        "semester",
        "credit hours",
        "course",
      ],
      courseCatalog: [
        "course catalog",
        "course description",
        "prerequisite",
        "corequisite",
        "credit value",
        "department",
      ],
      transferEvaluation: [
        "transfer evaluation",
        "transfer credit",
        "equivalent course",
        "accepted transfer",
        "articulation",
      ],
    };

    let isTranscript = false;
    let category: DocumentCategory = "other";

    const transcriptScore = this.scoreKeywords(content, keywords.transcript);
    const catalogScore = this.scoreKeywords(content, keywords.courseCatalog);
    const transferScore = this.scoreKeywords(
      content,
      keywords.transferEvaluation,
    );

    if (transcriptScore >= 2) {
      isTranscript = true;
      category = "transcript";
    } else if (catalogScore >= 2) {
      category = "course-catalog";
    } else if (transferScore >= 2) {
      category = "transfer-evaluation";
    }

    const transcriptStructure = isTranscript
      ? this.analyzeTranscriptStructure(content)
      : undefined;

    return {
      category,
      isTranscript,
      transcriptStructure,
      pageCount,
    };
  }

  private static async classifyImage(
    buffer: Buffer,
    fileName: string,
  ): Promise<ClassificationResult> {
    const isTranscript = fileName.toLowerCase().includes("transcript");
    const category: DocumentCategory = isTranscript ? "transcript" : "other";

    const transcriptStructure = isTranscript
      ? {
          hasStudentInfo: true,
          hasCourseList: true,
          hasGrades: true,
          hasGPA: false,
          hasCumulativeCredits: false,
          hasTermStructure: false,
          layoutType: "unknown" as const,
          pageBoundaries: [1],
        }
      : undefined;

    return {
      category,
      isTranscript,
      transcriptStructure,
    };
  }

  private static estimatePageCount(buffer: Buffer, fileName: string): number {
    if (fileName.toLowerCase().includes("transcript")) {
      return Math.max(1, Math.floor(buffer.length / 10000));
    }
    return 1;
  }

  private static scoreKeywords(content: string, keywords: string[]): number {
    const lowerContent = content.toLowerCase();
    return keywords.filter((keyword) => lowerContent.includes(keyword)).length;
  }

  private static analyzeTranscriptStructure(
    content: string,
  ): TranscriptStructure {
    const lowerContent = content.toLowerCase();

    const hasStudentInfo =
      lowerContent.includes("name") ||
      lowerContent.includes("student") ||
      lowerContent.includes("id") ||
      lowerContent.includes("student id");

    const hasCourseList =
      lowerContent.includes("course") ||
      lowerContent.includes("subject") ||
      lowerContent.includes("code");

    const hasGrades =
      lowerContent.includes("grade") ||
      lowerContent.includes("a ") ||
      lowerContent.includes("b ") ||
      lowerContent.includes("c ");

    const hasGPA =
      lowerContent.includes("gpa") ||
      lowerContent.includes("grade point average");

    const hasCumulativeCredits =
      lowerContent.includes("credit") || lowerContent.includes("hours");

    const hasTermStructure =
      lowerContent.includes("semester") ||
      lowerContent.includes("term") ||
      lowerContent.includes("quarter") ||
      lowerContent.includes("fall") ||
      lowerContent.includes("spring");

    const layoutType: TranscriptStructure["layoutType"] = hasTermStructure
      ? "standard"
      : hasCourseList
        ? "two-column"
        : "unknown";

    const pageBoundaries = this.detectPageBoundaries(content);

    return {
      hasStudentInfo,
      hasCourseList,
      hasGrades,
      hasGPA,
      hasCumulativeCredits,
      hasTermStructure,
      layoutType,
      pageBoundaries,
    };
  }

  private static detectPageBoundaries(content: string): number[] {
    const pageMarkers: number[] = [1];
    const pages = content.split(/page\s+\d+/i);

    for (let i = 1; i < pages.length; i++) {
      pageMarkers.push(i + 1);
    }

    return pageMarkers;
  }
}
