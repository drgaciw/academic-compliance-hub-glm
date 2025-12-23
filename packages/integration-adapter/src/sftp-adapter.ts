import * as SFTPModule from "ssh2-sftp-client";
import { parse as parseCSV } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";
import { BaseSISAdapter, AdapterConfig } from "./base-adapter";
import {
  SISCredentials,
  Session,
  StudentInfo,
  Transcript,
  CourseEnrollment,
  CourseInfo,
  GradeRecord,
  SISType,
} from "./index";

const Client = SFTPModule.default as any;

export interface SFTPCredentials extends SISCredentials {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
}

export interface FileFormat {
  type: "csv" | "xml" | "json";
  delimiter?: string;
  headers?: boolean;
  rootElement?: string;
}

export interface SFTPAdapterConfig extends AdapterConfig {
  defaultFileFormat?: FileFormat;
  baseDirectory?: string;
  fileEncoding?: BufferEncoding;
}

export class SFTPAdapter extends BaseSISAdapter {
  sisType: SISType = SISType.CUSTOM;

  private sftpClient: any;
  private activeSession?: Session;
  private baseDirectory: string;
  private fileEncoding: BufferEncoding;

  constructor(config: SFTPAdapterConfig = {}) {
    super(config);
    this.sftpClient = new Client();
    this.baseDirectory = config.baseDirectory || "/sis-data";
    this.fileEncoding = config.fileEncoding || "utf8";
  }

  async authenticate(credentials: SISCredentials): Promise<Session> {
    return this.executeWithRetry(async () => {
      const sftpCreds = credentials as SFTPCredentials;
      this.credentials = credentials;

      await this.sftpClient.connect({
        host: sftpCreds.host,
        port: sftpCreds.port,
        username: sftpCreds.username,
        password: sftpCreds.password,
        privateKey: sftpCreds.privateKey,
        passphrase: sftpCreds.passphrase,
        readyTimeout: this.config.timeout,
      });

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      this.activeSession = {
        sessionId: `sftp-${Date.now()}`,
        token: "sftp-connection",
        expiresAt,
        userId: sftpCreds.username,
      };

      return this.activeSession;
    }, "SFTP authentication");
  }

  async getStudentInfo(
    session: Session,
    studentId: string,
  ): Promise<StudentInfo> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const filePath = `${this.baseDirectory}/students/${studentId}.csv`;
      const content = await this.downloadFile(filePath);
      const data = this.parseFile(content, { type: "csv" }) as Record<
        string,
        unknown
      >;

      return {
        studentId: String(data.studentId ?? data.id ?? studentId),
        firstName: String(data.firstName ?? data.first_name ?? ""),
        lastName: String(data.lastName ?? data.last_name ?? ""),
        email: data.email as string | undefined,
        phoneNumber: data.phoneNumber as string | undefined,
        program: String(data.program ?? ""),
        major: String(data.major ?? ""),
        concentration: data.concentration as string | undefined,
        academicStanding:
          (data.academicStanding as
            | "GOOD"
            | "PROBATION"
            | "SUSPENDED"
            | "DISMISSED") || "GOOD",
        currentTerm: String(data.currentTerm ?? ""),
        advisorId: data.advisorId as string | undefined,
      };
    }, `getStudentInfo(${studentId})`);
  }

  async getTranscript(
    session: Session,
    studentId: string,
  ): Promise<Transcript> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const filePath = `${this.baseDirectory}/transcripts/${studentId}.csv`;
      const content = await this.downloadFile(filePath);
      const data = this.parseFile(content, { type: "csv" }) as Record<
        string,
        unknown
      >;

      return {
        studentId: String(data.studentId ?? studentId),
        studentName: String(data.studentName ?? data.name ?? ""),
        program: String(data.program ?? ""),
        major: String(data.major ?? ""),
        cumulativeGPA: Number(data.cumulativeGPA ?? data.gpa ?? 0),
        totalCredits: Number(data.totalCredits ?? 0),
        earnedCredits: Number(data.earnedCredits ?? 0),
        gradeRecords: (data.gradeRecords ?? data.grades ?? []) as GradeRecord[],
        lastUpdated: new Date(
          (data.lastUpdated as string | number | Date) ?? Date.now(),
        ),
      };
    }, `getTranscript(${studentId})`);
  }

  async getCurrentEnrollments(
    session: Session,
    studentId: string,
  ): Promise<CourseEnrollment[]> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const filePath = `${this.baseDirectory}/enrollments/${studentId}.csv`;
      const content = await this.downloadFile(filePath);
      const enrollments = this.parseFile(content, {
        type: "csv",
        isMultiple: true,
      });

      return (Array.isArray(enrollments) ? enrollments : []).map(
        (item: any) => ({
          courseId: String(item.courseId ?? item.course_id ?? ""),
          courseName: String(item.courseName ?? item.course_title ?? ""),
          termCode: String(item.termCode ?? item.term_code ?? ""),
          termName: String(item.termName ?? item.term_description ?? ""),
          status:
            (item.status as
              | "ENROLLED"
              | "DROPPED"
              | "WITHDRAWN"
              | "COMPLETED") || "ENROLLED",
          creditHours: Number(item.creditHours ?? item.credits ?? 0),
          enrollmentDate: new Date(
            (item.enrollmentDate as string | number | Date) ?? Date.now(),
          ),
        }),
      );
    }, `getCurrentEnrollments(${studentId})`);
  }

  async getCourseInfo(session: Session, courseId: string): Promise<CourseInfo> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const filePath = `${this.baseDirectory}/courses/${courseId}.csv`;
      const content = await this.downloadFile(filePath);
      const data = this.parseFile(content, { type: "csv" }) as Record<
        string,
        unknown
      >;

      return {
        courseId: String(data.courseId ?? data.id ?? courseId),
        courseName: String(data.courseName ?? data.title ?? ""),
        department: String(data.department ?? ""),
        credits: Number(data.credits ?? 0),
        description: data.description as string | undefined,
        prerequisites: data.prerequisites as string[] | undefined,
        corequisites: data.corequisites as string[] | undefined,
      };
    }, `getCourseInfo(${courseId})`);
  }

  async validateStudent(session: Session, studentId: string): Promise<boolean> {
    this.validateSession(session);

    try {
      await this.getStudentInfo(session, studentId);
      return true;
    } catch (error) {
      this.log(
        "warn",
        `Student validation failed for ${studentId}: ${(error as Error).message}`,
      );
      return false;
    }
  }

  async checkHold(session: Session, studentId: string): Promise<boolean> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const filePath = `${this.baseDirectory}/holds/${studentId}.csv`;
      try {
        const content = await this.downloadFile(filePath);
        const data = this.parseFile(content, { type: "csv" }) as Record<
          string,
          unknown
        >;
        const holds = data.holds ?? data ?? [];
        return Array.isArray(holds) ? holds.length > 0 : holds === true;
      } catch {
        return false;
      }
    }, `checkHold(${studentId})`);
  }

  async getGradeRecords(
    session: Session,
    studentId: string,
    termCode?: string,
  ): Promise<GradeRecord[]> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      let filePath = `${this.baseDirectory}/grades/${studentId}.csv`;
      if (termCode) {
        filePath = `${this.baseDirectory}/grades/${studentId}_${termCode}.csv`;
      }

      const content = await this.downloadFile(filePath);
      const grades = this.parseFile(content, {
        type: "csv",
        isMultiple: true,
      });

      return (Array.isArray(grades) ? grades : []).map((item: any) => ({
        courseId: String(item.courseId ?? item.course_id ?? ""),
        courseName: String(item.courseName ?? item.course_title ?? ""),
        termCode: String(item.termCode ?? item.term_code ?? ""),
        termName: String(item.termName ?? item.term_description ?? ""),
        creditHours: Number(item.creditHours ?? item.credits ?? 0),
        grade: String(item.grade ?? ""),
        gradePoints: Number(item.gradePoints ?? item.grade_points ?? 0),
        isRepeat: Boolean(item.isRepeat ?? item.is_repeat),
        isTransfer: Boolean(item.isTransfer ?? item.is_transfer),
        earnedCredits: Number(item.earnedCredits ?? item.earned_credits ?? 0),
        qualityPoints: Number(item.qualityPoints ?? item.quality_points ?? 0),
      }));
    }, `getGradeRecords(${studentId}, ${termCode})`);
  }

  async refreshToken(session: Session): Promise<Session> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      this.activeSession = {
        sessionId: session.sessionId,
        token: session.token,
        expiresAt,
        userId: session.userId,
      };

      return this.activeSession!;
    }, "refreshToken");
  }

  async logout(session: Session): Promise<void> {
    await this.executeWithRetry(async () => {
      try {
        await this.sftpClient.end();
      } catch (error) {
        this.log("warn", `Logout failed: ${(error as Error).message}`);
      }
      this.activeSession = undefined;
      this.sftpClient = new Client();
    }, "logout");
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.sftpClient.isConnected()) {
        return false;
      }
      await this.sftpClient.list(".");
      return true;
    } catch {
      return false;
    }
  }

  async downloadFile(remotePath: string): Promise<string> {
    const exists = await this.sftpClient.exists(remotePath);
    if (!exists) {
      throw this.createError(`File not found: ${remotePath}`);
    }

    const buffer = await this.sftpClient.get(remotePath);
    return buffer.toString(this.fileEncoding);
  }

  async uploadFile(remotePath: string, content: string): Promise<void> {
    const buffer = Buffer.from(content, this.fileEncoding);
    await this.sftpClient.put(buffer, remotePath);
  }

  async listFiles(directory: string): Promise<string[]> {
    return await this.sftpClient
      .list(directory)
      .then((files: any[]) => files.map((f: any) => f.name));
  }

  async deleteFile(remotePath: string): Promise<void> {
    await this.sftpClient.delete(remotePath);
  }

  async batchUpload(files: Map<string, string>): Promise<void> {
    const operations: Promise<void>[] = [];

    for (const [path, content] of files.entries()) {
      operations.push(this.uploadFile(path, content));
    }

    await Promise.all(operations);
  }

  async batchDownload(paths: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (const path of paths) {
      try {
        const content = await this.downloadFile(path);
        results.set(path, content);
      } catch (error) {
        this.log(
          "warn",
          `Failed to download ${path}: ${(error as Error).message}`,
        );
      }
    }

    return results;
  }

  async downloadTranscriptPDF(
    _session: Session,
    studentId: string,
  ): Promise<Buffer> {
    return this.executeWithRetry(async () => {
      const filePath = `${this.baseDirectory}/transcripts/${studentId}.pdf`;
      const buffer = await this.sftpClient.get(filePath);
      return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    }, `downloadTranscriptPDF(${studentId})`);
  }

  async submitEvaluation(
    session: Session,
    studentId: string,
    evaluationData: Record<string, unknown>,
  ): Promise<boolean> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `${this.baseDirectory}/evaluations/${studentId}_${timestamp}.csv`;

      const csvContent = this.objectToCSV(evaluationData);
      await this.uploadFile(fileName, csvContent);

      return true;
    }, `submitEvaluation(${studentId})`);
  }

  private parseFile(
    content: string,
    format: FileFormat & { isMultiple?: boolean },
  ): unknown {
    switch (format.type) {
      case "csv":
        if (format.isMultiple) {
          return parseCSV(content, {
            columns: format.headers,
            delimiter: format.delimiter || ",",
            skip_empty_lines: true,
          });
        } else {
          const records = parseCSV(content, {
            columns: format.headers,
            delimiter: format.delimiter || ",",
            skip_empty_lines: true,
          });
          return Array.isArray(records) && records.length > 0 ? records[0] : {};
        }
      case "xml":
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
        });
        return parser.parse(content);
      case "json":
        return JSON.parse(content);
      default:
        return content;
    }
  }

  private objectToCSV(obj: Record<string, unknown>): string {
    const headers = Object.keys(obj);
    const values = headers.map((key) => {
      const value = obj[key];
      return typeof value === "string" && value.includes(",")
        ? `"${value}"`
        : String(value ?? "");
    });

    return [headers.join(","), values.join(",")].join("\n");
  }

  protected validateSession(session: Session): void {
    if (!session || !session.token || !session.expiresAt) {
      throw this.createError("Invalid session: missing required fields");
    }

    if (new Date() >= session.expiresAt) {
      throw this.createError("Session has expired");
    }
  }
}
