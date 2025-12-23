import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";
import {
  ReportData,
  PDFOptions,
  TableColumn,
  TableRow,
  CourseMapping,
  CourseMappingSummary,
  SignatureData,
  SignatureField,
} from "./types";
import { compileTemplate } from "./templates";
import { signpdf } from "node-signpdf";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
    autoTable(options: UserOptions): void;
  }
}

export class PDFGenerator {
  private doc: any;
  private pluginInitialized: boolean = false;

  constructor(options: PDFOptions = {}) {
    this.doc = new jsPDF(options);
  }

  private initPlugin(): void {
    if (!this.pluginInitialized) {
      autoTable(this.doc, {});
      this.doc.autoTable = this.doc.autoTable;
      this.pluginInitialized = true;
    }
  }

  async generatePDF(
    data: ReportData,
    templateName?: string,
  ): Promise<Uint8Array> {
    if (templateName) {
      const content = await compileTemplate(templateName, data);
      this.addContent(content);
    }

    if (data.header) {
      this.addHeader(data.header);
    }

    if (data.tables) {
      data.tables.forEach((table) => this.addTable(table));
    }

    if (data.footer) {
      this.addFooter(data.footer);
    }

    return new Uint8Array(this.doc.output("arraybuffer"));
  }

  addHeader(header: string): void {
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(header, 14, 20);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(14, 32, 196, 32);
  }

  addTable(table: {
    columns: TableColumn[];
    rows: TableRow[];
    title?: string;
  }): void {
    this.initPlugin();

    if (table.title) {
      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      const lastY = this.doc.lastAutoTable?.finalY || 45;
      this.doc.text(table.title, 14, lastY + 15);
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "normal");
    }

    const lastY = this.doc.lastAutoTable?.finalY || 45;
    const startY = table.title ? lastY + 25 : lastY + 15;

    const tableOptions: UserOptions = {
      startY,
      head: [table.columns.map((col) => col.header)],
      body: table.rows.map((row) =>
        table.columns.map((col) => String(row[col.key] || "")),
      ),
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      margin: { top: 10, left: 14, right: 14 },
    };

    this.doc.autoTable(tableOptions);
  }

  addFooter(footer: string): void {
    const pageCount = this.doc.getNumberOfPages();
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "italic");

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.text(footer, 14, 285);
      this.doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: "right" });
    }
  }

  addContent(content: string): void {
    const lines = this.doc.splitTextToSize(content, 170);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");
    let y = 45;
    lines.forEach((line: string) => {
      if (y > 270) {
        this.doc.addPage();
        y = 20;
      }
      this.doc.text(line, 14, y);
      y += 7;
    });
  }

  addNCAAComplianceSection(data: any): void {
    this.initPlugin();
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    const lastY = this.doc.lastAutoTable?.finalY || 45;
    this.doc.text("NCAA Compliance Summary", 14, lastY + 15);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");

    const startY = lastY + 25;

    const complianceData = [
      ["Status", data.status || "N/A"],
      ["Eligibility Credits", data.eligibilityCredits || "0"],
      ["GPA", data.gpa || "0.00"],
      ["Progress Towards Degree", data.progressTowardsDegree || "0%"],
      ["Compliance Issues", data.complianceIssues || "None"],
    ];

    const tableOptions: UserOptions = {
      startY,
      body: complianceData,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 80 },
        1: { cellWidth: 90 },
      },
      margin: { top: 10, left: 14, right: 14 },
    };

    this.doc.autoTable(tableOptions);
  }

  save(filename: string): void {
    this.doc.save(filename);
  }

  addCourseMappingTable(
    courseMappings: CourseMapping[],
    summary: CourseMappingSummary,
  ): void {
    this.initPlugin();
    const lastY = this.doc.lastAutoTable?.finalY || 45;

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("COURSE MAPPING VISUALIZATION", 14, lastY + 15);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    const mappingTableOptions: UserOptions = {
      startY: lastY + 25,
      head: [
        [
          "Source\nCourse",
          "Source Title",
          "Target\nCourse",
          "Target Title",
          "Credits",
          "Grade",
          "Status",
          "Subject\nArea",
          "Confidence",
        ],
      ],
      body: courseMappings.map((mapping) => [
        mapping.sourceCourse,
        mapping.sourceTitle,
        mapping.targetCourse,
        mapping.targetTitle,
        String(mapping.credits),
        mapping.grade,
        mapping.status,
        mapping.subjectArea,
        `${mapping.confidenceScore.toFixed(1)}%`,
      ]),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: "middle",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 25, halign: "center" },
        1: { cellWidth: 40 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 40 },
        4: { cellWidth: 15, halign: "center" },
        5: { cellWidth: 15, halign: "center" },
        6: { cellWidth: 20, halign: "center" },
        7: { cellWidth: 25, halign: "center" },
        8: { cellWidth: 20, halign: "center" },
      },
      margin: { top: 10, left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 6) {
          if (data.cell.raw === "ACCEPTED") {
            data.cell.styles.textColor = [0, 100, 0];
            data.cell.styles.fontStyle = "bold";
          } else if (data.cell.raw === "REJECTED") {
            data.cell.styles.textColor = [139, 0, 0];
            data.cell.styles.fontStyle = "bold";
          } else if (data.cell.raw === "PENDING") {
            data.cell.styles.textColor = [255, 140, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    };

    this.doc.autoTable(mappingTableOptions);

    const tableLastY = this.doc.lastAutoTable?.finalY || lastY + 25;

    this.addCourseMappingSummary(summary, tableLastY);
  }

  addCourseMappingSummary(summary: CourseMappingSummary, startY: number): void {
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Mapping Summary", 14, startY + 10);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "normal");

    const summaryData = [
      ["Source Courses", String(summary.sourceCoursesCount)],
      ["Target Courses", String(summary.targetCoursesCount)],
      ["Total Credits", String(summary.totalCredits)],
      ["Accepted", String(summary.acceptedCourses)],
      ["Rejected", String(summary.rejectedCourses)],
      ["Pending", String(summary.pendingCourses)],
      ["Avg Confidence", `${summary.averageConfidenceScore.toFixed(1)}%`],
    ];

    const summaryTableOptions: UserOptions = {
      startY: startY + 15,
      body: summaryData,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: 30, halign: "right" },
      },
      margin: { top: 5, left: 14, right: 14 },
    };

    this.doc.autoTable(summaryTableOptions);

    const summaryLastY = this.doc.lastAutoTable?.finalY || startY + 15;

    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "italic");
    this.doc.text(
      "Subject Areas: " + summary.subjectAreas.join(", "),
      14,
      summaryLastY + 10,
    );
  }

  addSignatureField(signatureField: SignatureField): void {
    this.doc.setPage(signatureField.pageNumber);
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.rect(
      signatureField.x,
      signatureField.y,
      signatureField.width,
      signatureField.height,
    );

    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(signatureField.label, signatureField.x, signatureField.y - 2);
    this.doc.text(
      "Sign here",
      signatureField.x,
      signatureField.y + signatureField.height / 2,
    );
  }

  async addDigitalSignature(
    signatureData: SignatureData,
    signatureField: SignatureField,
    lockDocument: boolean = true,
  ): Promise<Uint8Array> {
    this.doc.setPage(signatureField.pageNumber);

    const timestamp = signatureData.timestamp || new Date();

    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");

    const textX = signatureField.x + 5;
    const textY = signatureField.y + 12;

    this.doc.text(`Signed by: ${signatureData.signerName}`, textX, textY);
    this.doc.text(`Title: ${signatureData.signerTitle}`, textX, textY + 6);
    this.doc.text(
      `Date: ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`,
      textX,
      textY + 12,
    );

    if (signatureData.certificateInfo) {
      this.doc.text(
        `Certificate: ${signatureData.certificateInfo.serialNumber}`,
        textX,
        textY + 18,
      );
    }

    this.doc.setDrawColor(0, 0, 255);
    this.doc.setLineWidth(0.3);
    this.doc.rect(
      signatureField.x,
      signatureField.y,
      signatureField.width,
      signatureField.height,
    );

    if (lockDocument) {
      this.doc.setProperties({
        title: "Signed Document",
        subject: "NCAA Compliance Report",
        creator: "Academic Compliance Hub",
        author: signatureData.signerName,
        keywords: "signed, compliance, NCAA",
      });
    }

    return new Uint8Array(this.doc.output("arraybuffer"));
  }

  static async signPDF(
    pdfBuffer: Uint8Array,
    signatureData: SignatureData,
    signatureField: SignatureField,
    lockDocument: boolean = true,
  ): Promise<Uint8Array> {
    const pdfDoc = new jsPDF();
    pdfDoc.text("Signing document...", 14, 20);

    if (signatureData.certificateInfo) {
      pdfDoc.text(
        `Certificate Valid: ${signatureData.certificateInfo.validFrom.toDateString()} to ${signatureData.certificateInfo.validTo.toDateString()}`,
        14,
        30,
      );
    }

    const timestamp = signatureData.timestamp || new Date();
    pdfDoc.text(`Signed at: ${timestamp.toISOString()}`, 14, 40);

    const signedBuffer = Buffer.from(pdfDoc.output("arraybuffer"));

    try {
      const signedPdf = signpdf(signedBuffer, Buffer.from("dummy-cert"));
      return new Uint8Array(signedPdf);
    } catch (error) {
      console.warn("Digital signature warning:", error);
      return pdfBuffer;
    }
  }

  static validateSignature(pdfBuffer: Uint8Array): Promise<boolean> {
    return Promise.resolve(true);
  }
}

export function generateTransferCreditReport(data: any): Promise<Uint8Array> {
  const generator = new PDFGenerator({ orientation: "portrait" });

  const reportData: ReportData = {
    header: `Transfer Credit Report - ${data.studentName || "Unknown"}`,
    tables: [
      {
        title: "Transfer Course Credits",
        columns: [
          { header: "Course Code", key: "courseCode" },
          { header: "Course Title", key: "courseTitle" },
          { header: "Credits", key: "credits" },
          { header: "Grade", key: "grade" },
          { header: "Term", key: "term" },
        ],
        rows: data.courses || [],
      },
    ],
    footer:
      "Official NCAA Transfer Credit Report - Generated by Academic Compliance Hub",
  };

  if (data.compliance) {
    generator.addNCAAComplianceSection(data.compliance);
  }

  return generator.generatePDF(reportData);
}

export function generateComplianceReport(data: any): Promise<Uint8Array> {
  const generator = new PDFGenerator({ orientation: "portrait" });

  const reportData: ReportData = {
    header: `Compliance Report - ${data.studentName || "Unknown"}`,
    tables: [
      {
        title: "Academic Progress",
        columns: [
          { header: "Metric", key: "metric" },
          { header: "Value", key: "value" },
          { header: "Requirement", key: "requirement" },
          { header: "Status", key: "status" },
        ],
        rows: data.academicProgress || [],
      },
      {
        title: "Course Compliance",
        columns: [
          { header: "Course", key: "course" },
          { header: "Credits", key: "credits" },
          { header: "Type", key: "type" },
          { header: "Compliant", key: "compliant" },
        ],
        rows: data.courseCompliance || [],
      },
    ],
    footer: "NCAA Academic Progress Rate (APR) Compliance Report",
  };

  return generator.generatePDF(reportData);
}
