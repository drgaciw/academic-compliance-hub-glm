import Papa from "papaparse";
import type {
  CourseMapping,
  CourseMappingSummary,
  AuditLog,
  TransferCreditData,
  ComplianceData,
  EligibilityData,
} from "../types";

export interface CSVExportOptions {
  includeHeaders?: boolean;
  delimiter?: string;
  quoteChar?: string;
  escapeChar?: string;
  newline?: string;
}

export interface EvaluationCSVRow {
  evaluationId: string;
  studentId: string;
  studentName: string;
  previousInstitution: string;
  totalCredits: number;
  transferGPA: number;
  status: string;
  evaluationDate: string;
  advisorId?: string;
  notes?: string;
}

export interface CourseMappingCSVRow {
  evaluationId: string;
  sourceCourse: string;
  sourceTitle: string;
  targetCourse: string;
  targetTitle: string;
  credits: number;
  grade: string;
  status: "ACCEPTED" | "REJECTED" | "PENDING";
  subjectArea: string;
  confidenceScore: number;
  conversionNotes?: string;
}

export interface AuditTrailCSVRow {
  logId: string;
  transferEvaluationId: string;
  agentType: string;
  action: string;
  timestamp: string;
  duration?: number;
  errorMessage?: string;
}

export interface SISCourseMappingRow {
  "Student ID": string;
  "Source Course Code": string;
  "Source Course Title": string;
  "Source Institution": string;
  "Target Course Code": string;
  "Target Course Title": string;
  Credits: number;
  Grade: string;
  "Equivalent Status": string;
  "Transfer Date": string;
  "Approved By": string;
  "Approval Date": string;
}

export class CSVExporter {
  private options: Required<CSVExportOptions>;

  constructor(options: CSVExportOptions = {}) {
    this.options = {
      includeHeaders: options.includeHeaders ?? true,
      delimiter: options.delimiter ?? ",",
      quoteChar: options.quoteChar ?? '"',
      escapeChar: options.escapeChar ?? '"',
      newline: options.newline ?? "\n",
    };
  }

  generateCSV<T extends Record<string, any>>(
    data: T[],
    headers?: string[],
  ): string {
    const config: Papa.UnparseConfig = {
      delimiter: this.options.delimiter,
      quotes: true,
      quoteChar: this.options.quoteChar,
      escapeChar: this.options.escapeChar,
      newline: this.options.newline,
      header: this.options.includeHeaders,
      columns: headers,
    };

    return Papa.unparse(data, config);
  }

  exportEvaluationResults(
    evaluationData: Array<{
      id: string;
      studentId: string;
      studentName: string;
      previousInstitution: string;
      totalCredits: number;
      transferGPA: number;
      status: string;
      evaluationDate: Date;
      advisorId?: string;
      notes?: string;
    }>,
  ): string {
    const rows: EvaluationCSVRow[] = evaluationData.map((ev) => ({
      evaluationId: ev.id,
      studentId: ev.studentId,
      studentName: ev.studentName,
      previousInstitution: ev.previousInstitution,
      totalCredits: ev.totalCredits,
      transferGPA: ev.transferGPA,
      status: ev.status,
      evaluationDate: ev.evaluationDate.toISOString(),
      advisorId: ev.advisorId,
      notes: ev.notes,
    }));

    return this.generateCSV(rows, [
      "evaluationId",
      "studentId",
      "studentName",
      "previousInstitution",
      "totalCredits",
      "transferGPA",
      "status",
      "evaluationDate",
      "advisorId",
      "notes",
    ]);
  }

  exportCourseMapping(
    evaluationId: string,
    studentId: string,
    courseMappings: CourseMapping[],
    approvedBy?: string,
    approvalDate?: Date,
  ): string {
    const rows: CourseMappingCSVRow[] = courseMappings.map((mapping) => ({
      evaluationId,
      studentId,
      sourceCourse: mapping.sourceCourse,
      sourceTitle: mapping.sourceTitle,
      targetCourse: mapping.targetCourse,
      targetTitle: mapping.targetTitle,
      credits: mapping.credits,
      grade: mapping.grade,
      status: mapping.status,
      subjectArea: mapping.subjectArea,
      confidenceScore: mapping.confidenceScore,
      conversionNotes: mapping.conversionNotes,
    }));

    return this.generateCSV(rows, [
      "evaluationId",
      "studentId",
      "sourceCourse",
      "sourceTitle",
      "targetCourse",
      "targetTitle",
      "credits",
      "grade",
      "status",
      "subjectArea",
      "confidenceScore",
      "conversionNotes",
    ]);
  }

  exportAuditTrail(auditLogs: AuditLog[]): string {
    const rows: AuditTrailCSVRow[] = auditLogs.map((log) => ({
      logId: log.id,
      transferEvaluationId: log.transferEvaluationId,
      agentType: log.agentType,
      action: log.action,
      timestamp: log.timestamp.toISOString(),
      duration: log.duration ?? undefined,
      errorMessage: log.errorMessage ?? undefined,
    }));

    return this.generateCSV(rows, [
      "logId",
      "transferEvaluationId",
      "agentType",
      "action",
      "timestamp",
      "duration",
      "errorMessage",
    ]);
  }

  exportSISFormat(
    studentId: string,
    studentName: string,
    previousInstitution: string,
    courseMappings: CourseMapping[],
    transferDate: Date,
    approvedBy: string,
  ): string {
    const rows: SISCourseMappingRow[] = courseMappings.map((mapping) => ({
      "Student ID": studentId,
      "Source Course Code": mapping.sourceCourse,
      "Source Course Title": mapping.sourceTitle,
      "Source Institution": previousInstitution,
      "Target Course Code": mapping.targetCourse,
      "Target Course Title": mapping.targetTitle,
      Credits: mapping.credits,
      Grade: mapping.grade,
      "Equivalent Status": mapping.status,
      "Transfer Date": transferDate.toISOString(),
      "Approved By": approvedBy,
      "Approval Date": new Date().toISOString(),
    }));

    return this.generateCSV(rows, [
      "Student ID",
      "Source Course Code",
      "Source Course Title",
      "Source Institution",
      "Target Course Code",
      "Target Course Title",
      "Credits",
      "Grade",
      "Equivalent Status",
      "Transfer Date",
      "Approved By",
      "Approval Date",
    ]);
  }

  exportTransferCreditSummary(
    data: TransferCreditData,
    courseMappings: CourseMapping[],
  ): string {
    const summaryData = [
      {
        Field: "Student Name",
        Value: data.studentName,
      },
      {
        Field: "Student ID",
        Value: data.studentId,
      },
      {
        Field: "Previous Institution",
        Value: data.previousInstitution,
      },
      {
        Field: "Transfer Date",
        Value: data.transferDate,
      },
      {
        Field: "Total Credits",
        Value: data.totalCredits.toString(),
      },
      {
        Field: "Transfer GPA",
        Value: data.transferGPA.toString(),
      },
      {
        Field: "Courses Evaluated",
        Value: courseMappings.length.toString(),
      },
      {
        Field: "Credits Accepted",
        Value: courseMappings
          .filter((m) => m.status === "ACCEPTED")
          .reduce((sum, m) => sum + m.credits, 0)
          .toString(),
      },
      {
        Field: "Credits Rejected",
        Value: courseMappings
          .filter((m) => m.status === "REJECTED")
          .reduce((sum, m) => sum + m.credits, 0)
          .toString(),
      },
      {
        Field: "Credits Pending",
        Value: courseMappings
          .filter((m) => m.status === "PENDING")
          .reduce((sum, m) => sum + m.credits, 0)
          .toString(),
      },
    ];

    const summaryCSV = this.generateCSV(summaryData, ["Field", "Value"]);
    const courseMappingCSV = this.exportCourseMapping(
      data.studentId,
      data.studentId,
      courseMappings,
    );

    return `${summaryCSV}\n\nCourse Mappings:\n${courseMappingCSV}`;
  }

  exportComplianceData(data: ComplianceData): string {
    const summaryData = [
      {
        Field: "Student Name",
        Value: data.studentName,
      },
      {
        Field: "Student ID",
        Value: data.studentId,
      },
      {
        Field: "Sport",
        Value: data.sport,
      },
      {
        Field: "Academic Year",
        Value: data.academicYear,
      },
      {
        Field: "GPA",
        Value: data.gpa.toString(),
      },
      {
        Field: "Total Credits",
        Value: data.totalCredits.toString(),
      },
      {
        Field: "Eligibility Credits",
        Value: data.eligibilityCredits.toString(),
      },
      {
        Field: "Progress Towards Degree",
        Value: `${data.progressTowardsDegree}%`,
      },
      {
        Field: "Compliance Status",
        Value: data.status,
      },
    ];

    const summaryCSV = this.generateCSV(summaryData, ["Field", "Value"]);

    const courseRows = data.courses.map((course) => ({
      "Course Code": course.courseCode,
      "Course Title": course.courseTitle,
      Credits: course.credits,
      Status: course.status,
    }));

    const coursesCSV = this.generateCSV(courseRows, [
      "Course Code",
      "Course Title",
      "Credits",
      "Status",
    ]);

    return `${summaryCSV}\n\nCourses:\n${coursesCSV}`;
  }

  exportEligibilityData(data: EligibilityData): string {
    const summaryData = [
      {
        Field: "Student Name",
        Value: data.studentName,
      },
      {
        Field: "Student ID",
        Value: data.studentId,
      },
      {
        Field: "Sport",
        Value: data.sport,
      },
      {
        Field: "Division",
        Value: data.division,
      },
      {
        Field: "Core GPA",
        Value: data.coreGPA.toString(),
      },
      {
        Field: "Test Score",
        Value: data.testScore,
      },
      {
        Field: "Initial Eligibility",
        Value: data.initialEligibility,
      },
      {
        Field: "Current GPA",
        Value: data.currentGPA.toString(),
      },
      {
        Field: "Cumulative Credits",
        Value: data.cumulativeCredits.toString(),
      },
      {
        Field: "APR Progress",
        Value: `${data.aprProgress}%`,
      },
      {
        Field: "Eligibility Status",
        Value: data.eligibilityStatus,
      },
      {
        Field: "Six Hour Rule Compliant",
        Value: data.sixHourRule ? "Yes" : "No",
      },
    ];

    const summaryCSV = this.generateCSV(summaryData, ["Field", "Value"]);

    const requirementRows = data.requirements.map((req) => ({
      Requirement: req.name,
      "Current Value": req.value.toString(),
      Required: req.required.toString(),
      Status: req.status,
    }));

    const requirementsCSV = this.generateCSV(requirementRows, [
      "Requirement",
      "Current Value",
      "Required",
      "Status",
    ]);

    return `${summaryCSV}\n\nRequirements:\n${requirementsCSV}`;
  }
}

export const csvExporter = new CSVExporter();

export default csvExporter;
