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

interface PeopleSoftWebhook {
  eventId: string;
  eventType: string;
  studentId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export class PeopleSoftAdapter extends BaseSISAdapter {
  sisType: SISType = SISType.PEOPLESOFT;

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
        url: `${credentials.baseUrl}/PSFT_HR/psapi.svc/v1/login`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...credentials.additionalHeaders,
        },
        timeout: this.config.timeout,
      };

      if (credentials.apiKey) {
        authConfig.headers!["X-API-KEY"] = credentials.apiKey;
      } else if (credentials.clientId && credentials.clientSecret) {
        authConfig.data = {
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
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
        `${credentials.baseUrl}/PSFT_HR/psapi.svc/v1/login`,
        response.status,
        true,
        duration,
      );

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      this.activeSession = {
        sessionId: response.data.sessionId || response.data.JSESSIONID,
        token:
          response.data.access_token ||
          response.data.token ||
          response.data.JSESSIONID,
        expiresAt,
        userId: response.data.userId || credentials.username,
      };

      return this.activeSession;
    }, "PeopleSoft authentication");
  }

  async getStudentInfo(
    session: Session,
    studentId: string,
  ): Promise<StudentInfo> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const response = await this.httpClient.get(
        `${this.credentials!.baseUrl}/PSFT_HR/psapi.svc/v1/student/${studentId}`,
        this.getAuthConfig(session),
      );

      const data = response.data;
      return {
        studentId: data.EMPLID || data.studentId || data.id,
        firstName: data.FIRST_NAME || data.firstName,
        lastName: data.LAST_NAME || data.lastName,
        email: data.EMAIL_ADDR || data.email,
        phoneNumber: data.PHONE || data.phoneNumber,
        program: data.ACAD_PROG || data.program,
        major: data.ACAD_PLAN || data.major,
        concentration: data.DEGR_CONC || data.concentration,
        academicStanding: data.STDNT_CAR_NBR || data.academicStanding || "GOOD",
        currentTerm: data.STRM || data.currentTerm,
        advisorId: data.ADVISOR_ID || data.advisorId,
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
        `${this.credentials!.baseUrl}/PSFT_HR/psapi.svc/v1/student/${studentId}/transcript`,
        this.getAuthConfig(session),
      );

      const data = response.data;
      return {
        studentId: data.EMPLID || studentId,
        studentName: data.NAME || data.studentName,
        program: data.ACAD_PROG || data.program,
        major: data.ACAD_PLAN || data.major,
        cumulativeGPA: data.CUM_GPA || data.cumulativeGPA || 0,
        totalCredits: data.TOT_CUM_TAKEN || data.totalCredits || 0,
        earnedCredits: data.TOT_CUM_EARNED || data.earnedCredits || 0,
        gradeRecords: data.GRADES || data.gradeRecords || [],
        lastUpdated: new Date(
          data.LAST_UPD_DT || data.lastUpdated || Date.now(),
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
      const response = await this.httpClient.get(
        `${this.credentials!.baseUrl}/PSFT_HR/psapi.svc/v1/student/${studentId}/enrollments`,
        this.getAuthConfig(session),
      );

      return (response.data.ENROLLMENTS || response.data || []).map(
        (item: any) => ({
          courseId: item.CRSE_ID || item.courseId,
          courseName: item.CRSE_TITLE || item.courseName,
          termCode: item.STRM || item.termCode,
          termName: item.DESCR || item.termName,
          status: item.ENRL_STATUS || item.status || "ENROLLED",
          creditHours: item.UNITS_TAKEN || item.creditHours || 0,
          enrollmentDate: new Date(
            item.ENRL_DT || item.enrollmentDate || Date.now(),
          ),
        }),
      );
    }, `getCurrentEnrollments(${studentId})`);
  }

  async getCourseInfo(session: Session, courseId: string): Promise<CourseInfo> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const response = await this.httpClient.get(
        `${this.credentials!.baseUrl}/PSFT_HR/psapi.svc/v1/course/${courseId}`,
        this.getAuthConfig(session),
      );

      const data = response.data;
      return {
        courseId: data.CRSE_ID || data.courseId,
        courseName: data.CRSE_TITLE || data.courseName,
        department: data.SUBJECT || data.department,
        credits: data.UNITS_MINIMUM || data.credits || 0,
        description: data.DESCR || data.description,
        prerequisites: data.PREREQ || data.prerequisites,
        corequisites: data.COREQ || data.corequisites,
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
        `${this.credentials!.baseUrl}/PSFT_HR/psapi.svc/v1/student/${studentId}/holds`,
        this.getAuthConfig(session),
      );

      const holds = response.data.HOLDS || response.data || [];
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
      let url = `${this.credentials!.baseUrl}/PSFT_HR/psapi.svc/v1/student/${studentId}/grades`;
      if (termCode) {
        url += `?STRM=${termCode}`;
      }

      const response = await this.httpClient.get(
        url,
        this.getAuthConfig(session),
      );

      return (response.data.GRADES || response.data || []).map((item: any) => ({
        courseId: item.CRSE_ID || item.courseId,
        courseName: item.CRSE_TITLE || item.courseName,
        termCode: item.STRM || item.termCode,
        termName: item.DESCR || item.termName,
        creditHours: item.UNITS_TAKEN || item.creditHours || 0,
        grade: item.GRDE || item.grade,
        gradePoints: item.GRDE_POINTS || item.gradePoints || 0,
        isRepeat: item.REPEAT_NBR ? true : false,
        isTransfer: item.TRANSFER_FLAG === "Y",
        earnedCredits: item.UNITS_EARNED || item.earnedCredits || 0,
        qualityPoints: item.QUALITY_POINTS || item.qualityPoints || 0,
      }));
    }, `getGradeRecords(${studentId}, ${termCode})`);
  }

  async refreshToken(session: Session): Promise<Session> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const response = await this.httpClient.post(
        `${this.credentials!.baseUrl}/PSFT_HR/psapi.svc/v1/refresh`,
        { JSESSIONID: session.sessionId },
        this.getAuthConfig(session),
      );

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      this.activeSession = {
        sessionId: response.data.JSESSIONID || session.sessionId,
        token:
          response.data.access_token ||
          response.data.JSESSIONID ||
          session.token,
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
          `${this.credentials!.baseUrl}/PSFT_HR/psapi.svc/v1/logout`,
          { JSESSIONID: session.sessionId },
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
        `${this.credentials!.baseUrl}/PSFT_HR/psapi.svc/v1/health`,
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
        `${this.credentials!.baseUrl}/PSFT_HR/psapi.svc/v1/student/${studentId}/transcript/pdf`,
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
        `${this.credentials!.baseUrl}/PSFT_HR/psapi.svc/v1/student/${studentId}/evaluation`,
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
        `${this.credentials!.baseUrl}/PSFT_HR/psapi.svc/v1/webhooks`,
        { url, events },
        {
          headers: this.credentials!.additionalHeaders,
        },
      );

      return response.status === 201;
    }, "registerWebhook");
  }

  async handleWebhook(webhookData: PeopleSoftWebhook): Promise<void> {
    this.log(
      "info",
      `Received PeopleSoft webhook: ${webhookData.eventType} for student ${webhookData.studentId}`,
    );

    switch (webhookData.eventType) {
      case "student.enrolled":
      case "grade.posted":
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
        Accept: "application/json",
        ...this.credentials?.additionalHeaders,
      },
      timeout: this.config.timeout,
    };
  }
}
