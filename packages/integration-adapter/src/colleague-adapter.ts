import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
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

interface ColleagueWebhook {
  eventId: string;
  eventType: string;
  studentId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export class ColleagueAdapter extends BaseSISAdapter {
  sisType: SISType = SISType.COLLEAGUE;

  private httpClient: AxiosInstance;
  private activeSession?: Session;

  constructor(config: AdapterConfig = {}) {
    super(config);
    this.httpClient = axios.create({
      timeout: this.config.timeout,
    });
  }

  async authenticate(credentials: SISCredentials): Promise<Session> {
    return this.executeWithRetry(async () => {
      this.credentials = credentials;

      const authConfig: AxiosRequestConfig = {
        method: "post",
        url: `${credentials.baseUrl}/api/auth/login`,
        headers: {
          "Content-Type": "application/json",
          "X-Ellucian-Media-Type":
            "application/vnd.hedtech.integration.v8+json",
          ...credentials.additionalHeaders,
        },
        timeout: this.config.timeout,
      };

      if (credentials.apiKey) {
        authConfig.headers!["Authorization"] = `Bearer ${credentials.apiKey}`;
      } else if (credentials.clientId && credentials.clientSecret) {
        authConfig.data = {
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          grant_type: "client_credentials",
        };
      } else if (credentials.username && credentials.password) {
        authConfig.data = {
          username: credentials.username,
          password: credentials.password,
        };
      }

      const startTime = Date.now();
      const response = await this.httpClient.request(authConfig);
      const duration = Date.now() - startTime;

      this.logRequest(
        "POST",
        `${credentials.baseUrl}/api/auth/login`,
        response.status,
        true,
        duration,
      );

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      this.activeSession = {
        sessionId: response.data.sessionId || response.data.id,
        token: response.data.access_token || response.data.token,
        expiresAt,
        userId: response.data.userId || credentials.username,
      };

      return this.activeSession;
    }, "Colleague authentication");
  }

  async getStudentInfo(
    session: Session,
    studentId: string,
  ): Promise<StudentInfo> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const response = await this.httpClient.get(
        `${this.credentials!.baseUrl}/api/students/${studentId}`,
        this.getAuthConfig(session),
      );

      const data = response.data;
      return {
        studentId: data.id || data.studentId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        program: data.program,
        major: data.major,
        concentration: data.concentration,
        academicStanding: data.academicStanding || "GOOD",
        currentTerm: data.currentTerm,
        advisorId: data.advisorId,
      };
    }, `getStudentInfo(${studentId})`);
  }

  async getTranscript(
    session: Session,
    studentId: string,
  ): Promise<Transcript> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const response = await this.httpClient.get(
        `${this.credentials!.baseUrl}/api/students/${studentId}/transcripts`,
        this.getAuthConfig(session),
      );

      const data = response.data;
      return {
        studentId: data.id || studentId,
        studentName: data.name || data.studentName,
        program: data.program,
        major: data.major,
        cumulativeGPA: data.cumulativeGpa || 0,
        totalCredits: data.totalCredits || 0,
        earnedCredits: data.earnedCredits || 0,
        gradeRecords: data.grades || data.gradeRecords || [],
        lastUpdated: new Date(data.lastUpdated || Date.now()),
      };
    }, `getTranscript(${studentId})`);
  }

  async getCurrentEnrollments(
    session: Session,
    studentId: string,
  ): Promise<CourseEnrollment[]> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const response = await this.httpClient.get(
        `${this.credentials!.baseUrl}/api/students/${studentId}/enrollments`,
        this.getAuthConfig(session),
      );

      return (response.data || []).map((item: any) => ({
        courseId: item.courseId,
        courseName: item.courseTitle,
        termCode: item.termCode,
        termName: item.termDescription,
        status: item.status || "ENROLLED",
        creditHours: item.creditHours || 0,
        enrollmentDate: new Date(item.enrollmentDate || Date.now()),
      }));
    }, `getCurrentEnrollments(${studentId})`);
  }

  async getCourseInfo(session: Session, courseId: string): Promise<CourseInfo> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const response = await this.httpClient.get(
        `${this.credentials!.baseUrl}/api/courses/${courseId}`,
        this.getAuthConfig(session),
      );

      const data = response.data;
      return {
        courseId: data.id || data.courseId,
        courseName: data.title || data.courseName,
        department: data.department,
        credits: data.credits || 0,
        description: data.description,
        prerequisites: data.prerequisites,
        corequisites: data.corequisites,
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
      const response = await this.httpClient.get(
        `${this.credentials!.baseUrl}/api/students/${studentId}/holds`,
        this.getAuthConfig(session),
      );

      const holds = response.data || [];
      return holds.length > 0;
    }, `checkHold(${studentId})`);
  }

  async getGradeRecords(
    session: Session,
    studentId: string,
    termCode?: string,
  ): Promise<GradeRecord[]> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      let url = `${this.credentials!.baseUrl}/api/students/${studentId}/grades`;
      if (termCode) {
        url += `?term=${termCode}`;
      }

      const response = await this.httpClient.get(
        url,
        this.getAuthConfig(session),
      );

      return (response.data || []).map((item: any) => ({
        courseId: item.courseId,
        courseName: item.courseTitle,
        termCode: item.termCode,
        termName: item.termDescription,
        creditHours: item.creditHours || 0,
        grade: item.grade,
        gradePoints: item.gradePoints || 0,
        isRepeat: item.isRepeat || false,
        isTransfer: item.isTransfer || false,
        earnedCredits: item.earnedCredits || 0,
        qualityPoints: item.qualityPoints || 0,
      }));
    }, `getGradeRecords(${studentId}, ${termCode})`);
  }

  async refreshToken(session: Session): Promise<Session> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const response = await this.httpClient.post(
        `${this.credentials!.baseUrl}/api/auth/refresh`,
        { refreshToken: session.token },
        this.getAuthConfig(session),
      );

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      this.activeSession = {
        sessionId: response.data.sessionId || session.sessionId,
        token: response.data.access_token || response.data.token,
        expiresAt,
        userId: session.userId,
      };

      return this.activeSession!;
    }, "refreshToken");
  }

  async logout(session: Session): Promise<void> {
    await this.executeWithRetry(async () => {
      try {
        await this.httpClient.post(
          `${this.credentials!.baseUrl}/api/auth/logout`,
          { sessionId: session.sessionId },
          this.getAuthConfig(session),
        );
      } catch (error) {
        this.log("warn", `Logout failed: ${(error as Error).message}`);
      }
      this.activeSession = undefined;
    }, "logout");
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get(
        `${this.credentials!.baseUrl}/api/health`,
        { timeout: 5000 },
      );
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async downloadTranscriptPDF(
    session: Session,
    studentId: string,
  ): Promise<Buffer> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const response = await this.httpClient.get(
        `${this.credentials!.baseUrl}/api/students/${studentId}/transcripts/pdf`,
        {
          ...this.getAuthConfig(session),
          responseType: "arraybuffer",
        },
      );

      return Buffer.from(response.data);
    }, `downloadTranscriptPDF(${studentId})`);
  }

  async submitEvaluation(
    session: Session,
    studentId: string,
    evaluationData: Record<string, unknown>,
  ): Promise<boolean> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const response = await this.httpClient.post(
        `${this.credentials!.baseUrl}/api/students/${studentId}/evaluations`,
        evaluationData,
        this.getAuthConfig(session),
      );

      return response.status === 201 || response.status === 200;
    }, `submitEvaluation(${studentId})`);
  }

  async registerWebhook(url: string, events: string[]): Promise<boolean> {
    if (!this.credentials) {
      throw this.createError("No credentials available. Authenticate first.");
    }

    return this.executeWithRetry(async () => {
      const response = await this.httpClient.post(
        `${this.credentials!.baseUrl}/api/webhooks`,
        { url, events },
        {
          headers: this.credentials!.additionalHeaders,
        },
      );

      return response.status === 201;
    }, "registerWebhook");
  }

  async handleWebhook(webhookData: ColleagueWebhook): Promise<void> {
    this.log(
      "info",
      `Received Colleague webhook: ${webhookData.eventType} for student ${webhookData.studentId}`,
    );

    switch (webhookData.eventType) {
      case "student.enrolled":
      case "grade.changed":
      case "transcript.updated":
        this.log("info", `Processing ${webhookData.eventType}`);
        break;
      default:
        this.log(
          "warn",
          `Unknown webhook event type: ${webhookData.eventType}`,
        );
    }
  }

  private getAuthConfig(session: Session): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
        "X-Ellucian-Media-Type": "application/vnd.hedtech.integration.v8+json",
        ...this.credentials?.additionalHeaders,
      },
      timeout: this.config.timeout,
    };
  }
}
