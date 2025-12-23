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

export interface FieldMapping {
  source: string;
  target: string;
  transform?: (value: unknown) => unknown;
}

export interface EndpointConfig {
  authenticate: string;
  getStudentInfo: string;
  getTranscript: string;
  getCurrentEnrollments: string;
  getCourseInfo: string;
  validateStudent: string;
  checkHold: string;
  getGradeRecords: string;
  refreshToken: string;
  logout: string;
  healthCheck: string;
  downloadTranscriptPDF?: string;
  submitEvaluation?: string;
}

export interface CustomRestAdapterConfig extends AdapterConfig {
  fieldMappings?: {
    studentInfo?: FieldMapping[];
    transcript?: FieldMapping[];
    enrollment?: FieldMapping[];
    courseInfo?: FieldMapping[];
    gradeRecord?: FieldMapping[];
  };
  endpoints?: Partial<EndpointConfig>;
  responseWrapperPath?: string;
}

export class CustomRestAdapter extends BaseSISAdapter {
  sisType: SISType = SISType.CUSTOM;

  private httpClient: AxiosInstance;
  private activeSession?: Session;
  private fieldMappings: Required<CustomRestAdapterConfig>["fieldMappings"];
  private endpoints: EndpointConfig;
  private responseWrapperPath?: string;

  constructor(config: CustomRestAdapterConfig = {}) {
    super(config);
    this.httpClient = axios.create({
      timeout: this.config.timeout,
    });

    this.fieldMappings = {
      studentInfo: config.fieldMappings?.studentInfo || [],
      transcript: config.fieldMappings?.transcript || [],
      enrollment: config.fieldMappings?.enrollment || [],
      courseInfo: config.fieldMappings?.courseInfo || [],
      gradeRecord: config.fieldMappings?.gradeRecord || [],
    };

    this.endpoints = {
      authenticate: config.endpoints?.authenticate || "/api/auth/login",
      getStudentInfo:
        config.endpoints?.getStudentInfo || "/api/students/{studentId}",
      getTranscript:
        config.endpoints?.getTranscript ||
        "/api/students/{studentId}/transcript",
      getCurrentEnrollments:
        config.endpoints?.getCurrentEnrollments ||
        "/api/students/{studentId}/enrollments",
      getCourseInfo:
        config.endpoints?.getCourseInfo || "/api/courses/{courseId}",
      validateStudent:
        config.endpoints?.validateStudent ||
        "/api/students/{studentId}/validate",
      checkHold:
        config.endpoints?.checkHold || "/api/students/{studentId}/holds",
      getGradeRecords:
        config.endpoints?.getGradeRecords || "/api/students/{studentId}/grades",
      refreshToken: config.endpoints?.refreshToken || "/api/auth/refresh",
      logout: config.endpoints?.logout || "/api/auth/logout",
      healthCheck: config.endpoints?.healthCheck || "/api/health",
      downloadTranscriptPDF:
        config.endpoints?.downloadTranscriptPDF ||
        "/api/students/{studentId}/transcript/pdf",
      submitEvaluation:
        config.endpoints?.submitEvaluation ||
        "/api/students/{studentId}/evaluations",
    };

    this.responseWrapperPath = config.responseWrapperPath;
  }

  async authenticate(credentials: SISCredentials): Promise<Session> {
    return this.executeWithRetry(async () => {
      this.credentials = credentials;

      const url = `${credentials.baseUrl}${this.endpoints.authenticate}`;

      const authConfig: AxiosRequestConfig = {
        method: "post",
        url,
        headers: {
          "Content-Type": "application/json",
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

      this.logRequest("POST", url, response.status, true, duration);

      const data = this.unwrapResponse(response.data);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      this.activeSession = {
        sessionId: String(data.sessionId ?? data.id ?? data.token ?? ""),
        token: String(data.access_token ?? data.token ?? data.apiKey ?? ""),
        expiresAt,
        userId: String(data.userId ?? credentials.username ?? ""),
      };

      return this.activeSession!;
    }, "Custom REST authentication");
  }

  async getStudentInfo(
    session: Session,
    studentId: string,
  ): Promise<StudentInfo> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const url = `${this.credentials!.baseUrl}${this.endpoints.getStudentInfo.replace("{studentId}", studentId)}`;
      const response = await this.httpClient.get(
        url,
        this.getAuthConfig(session),
      );

      const data = this.unwrapResponse(response.data);
      const mapped = this.applyFieldMappings(
        data,
        this.fieldMappings.studentInfo || [],
      );

      const mappedRecord = mapped as Record<string, unknown>;

      return {
        studentId: String(
          mappedRecord.studentId ?? mappedRecord.id ?? studentId,
        ),
        firstName: String(
          mappedRecord.firstName ?? mappedRecord.first_name ?? "",
        ),
        lastName: String(mappedRecord.lastName ?? mappedRecord.last_name ?? ""),
        email: mappedRecord.email as string | undefined,
        phoneNumber: mappedRecord.phoneNumber as string | undefined,
        program: String(mappedRecord.program ?? ""),
        major: String(mappedRecord.major ?? ""),
        concentration: mappedRecord.concentration as string | undefined,
        academicStanding:
          (mappedRecord.academicStanding as
            | "GOOD"
            | "PROBATION"
            | "SUSPENDED"
            | "DISMISSED") ?? "GOOD",
        currentTerm: String(mappedRecord.currentTerm ?? ""),
        advisorId: mappedRecord.advisorId as string | undefined,
      };
    }, `getStudentInfo(${studentId})`);
  }

  async getTranscript(
    session: Session,
    studentId: string,
  ): Promise<Transcript> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const url = `${this.credentials!.baseUrl}${this.endpoints.getTranscript.replace("{studentId}", studentId)}`;
      const response = await this.httpClient.get(
        url,
        this.getAuthConfig(session),
      );

      const data = this.unwrapResponse(response.data);
      const mapped = this.applyFieldMappings(
        data,
        this.fieldMappings.transcript || [],
      );

      const mappedRecord = mapped as Record<string, unknown>;

      return {
        studentId: String(mappedRecord.studentId ?? studentId),
        studentName: String(
          mappedRecord.studentName ?? mappedRecord.name ?? "",
        ),
        program: String(mappedRecord.program ?? ""),
        major: String(mappedRecord.major ?? ""),
        cumulativeGPA: Number(
          mappedRecord.cumulativeGPA ?? mappedRecord.gpa ?? 0,
        ),
        totalCredits: Number(mappedRecord.totalCredits ?? 0),
        earnedCredits: Number(mappedRecord.earnedCredits ?? 0),
        gradeRecords: (mappedRecord.gradeRecords ??
          mappedRecord.grades ??
          []) as GradeRecord[],
        lastUpdated: new Date(
          (mappedRecord.lastUpdated as string | number | Date) ?? Date.now(),
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
      const url = `${this.credentials!.baseUrl}${this.endpoints.getCurrentEnrollments.replace("{studentId}", studentId)}`;
      const response = await this.httpClient.get(
        url,
        this.getAuthConfig(session),
      );

      const data = this.unwrapResponse(response.data);
      const enrollments = Array.isArray(data)
        ? data
        : (data as Record<string, unknown>).enrollments || data || [];

      return (enrollments as unknown[]).map((item: unknown) => {
        const mapped = this.applyFieldMappings(
          item as Record<string, unknown>,
          this.fieldMappings.enrollment || [],
        );
        const mappedRecord = mapped as Record<string, unknown>;

        return {
          courseId: String(
            mappedRecord.courseId ?? mappedRecord.course_id ?? "",
          ),
          courseName: String(
            mappedRecord.courseName ?? mappedRecord.course_title ?? "",
          ),
          termCode: String(
            mappedRecord.termCode ?? mappedRecord.term_code ?? "",
          ),
          termName: String(
            mappedRecord.termName ?? mappedRecord.term_description ?? "",
          ),
          status:
            (mappedRecord.status as
              | "ENROLLED"
              | "DROPPED"
              | "WITHDRAWN"
              | "COMPLETED") ?? "ENROLLED",
          creditHours: Number(
            mappedRecord.creditHours ?? mappedRecord.credits ?? 0,
          ),
          enrollmentDate: new Date(
            (mappedRecord.enrollmentDate as string | number | Date) ??
              Date.now(),
          ),
        };
      });
    }, `getCurrentEnrollments(${studentId})`);
  }

  async getCourseInfo(session: Session, courseId: string): Promise<CourseInfo> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const url = `${this.credentials!.baseUrl}${this.endpoints.getCourseInfo.replace("{courseId}", courseId)}`;
      const response = await this.httpClient.get(
        url,
        this.getAuthConfig(session),
      );

      const data = this.unwrapResponse(response.data);
      const mapped = this.applyFieldMappings(
        data,
        this.fieldMappings.courseInfo || [],
      );

      const mappedRecord = mapped as Record<string, unknown>;

      return {
        courseId: String(mappedRecord.courseId ?? mappedRecord.id ?? courseId),
        courseName: String(mappedRecord.courseName ?? mappedRecord.title ?? ""),
        department: String(mappedRecord.department ?? ""),
        credits: Number(mappedRecord.credits ?? 0),
        description: mappedRecord.description as string | undefined,
        prerequisites: mappedRecord.prerequisites as string[] | undefined,
        corequisites: mappedRecord.corequisites as string[] | undefined,
      };
    }, `getCourseInfo(${courseId})`);
  }

  async validateStudent(session: Session, studentId: string): Promise<boolean> {
    this.validateSession(session);

    try {
      const url = `${this.credentials!.baseUrl}${this.endpoints.validateStudent.replace("{studentId}", studentId)}`;
      const response = await this.httpClient.get(
        url,
        this.getAuthConfig(session),
      );
      const data = this.unwrapResponse(response.data) as Record<
        string,
        unknown
      >;
      return (
        data.valid === true || data.exists === true || response.status === 200
      );
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
      const url = `${this.credentials!.baseUrl}${this.endpoints.checkHold.replace("{studentId}", studentId)}`;
      const response = await this.httpClient.get(
        url,
        this.getAuthConfig(session),
      );

      const data = this.unwrapResponse(response.data) as Record<
        string,
        unknown
      >;
      const holds = data.holds ?? data ?? [];
      return Array.isArray(holds) ? holds.length > 0 : holds === true;
    }, `checkHold(${studentId})`);
  }

  async getGradeRecords(
    session: Session,
    studentId: string,
    termCode?: string,
  ): Promise<GradeRecord[]> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      let url = `${this.credentials!.baseUrl}${this.endpoints.getGradeRecords.replace("{studentId}", studentId)}`;
      if (termCode) {
        url += `?term=${termCode}`;
      }

      const response = await this.httpClient.get(
        url,
        this.getAuthConfig(session),
      );
      const data = this.unwrapResponse(response.data) as Record<
        string,
        unknown
      >;
      const grades = Array.isArray(data) ? data : data.grades || data || [];

      return (grades as unknown[]).map((item: unknown) => {
        const mapped = this.applyFieldMappings(
          item as Record<string, unknown>,
          this.fieldMappings.gradeRecord || [],
        );
        const mappedRecord = mapped as Record<string, unknown>;

        return {
          courseId: String(
            mappedRecord.courseId ?? mappedRecord.course_id ?? "",
          ),
          courseName: String(
            mappedRecord.courseName ?? mappedRecord.course_title ?? "",
          ),
          termCode: String(
            mappedRecord.termCode ?? mappedRecord.term_code ?? "",
          ),
          termName: String(
            mappedRecord.termName ?? mappedRecord.term_description ?? "",
          ),
          creditHours: Number(
            mappedRecord.creditHours ?? mappedRecord.credits ?? 0,
          ),
          grade: String(mappedRecord.grade ?? ""),
          gradePoints: Number(
            mappedRecord.gradePoints ?? mappedRecord.grade_points ?? 0,
          ),
          isRepeat: Boolean(mappedRecord.isRepeat ?? mappedRecord.is_repeat),
          isTransfer: Boolean(
            mappedRecord.isTransfer ?? mappedRecord.is_transfer,
          ),
          earnedCredits: Number(
            mappedRecord.earnedCredits ?? mappedRecord.earned_credits ?? 0,
          ),
          qualityPoints: Number(
            mappedRecord.qualityPoints ?? mappedRecord.quality_points ?? 0,
          ),
        };
      });
    }, `getGradeRecords(${studentId}, ${termCode})`);
  }

  async refreshToken(session: Session): Promise<Session> {
    this.validateSession(session);

    return this.executeWithRetry(async () => {
      const url = `${this.credentials!.baseUrl}${this.endpoints.refreshToken}`;
      const response = await this.httpClient.post(
        url,
        { token: session.token },
        this.getAuthConfig(session),
      );

      const data = this.unwrapResponse(response.data) as Record<
        string,
        unknown
      >;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      this.activeSession = {
        sessionId: String(data.sessionId ?? data.id ?? session.sessionId),
        token: String(
          data.access_token ?? data.token ?? data.newToken ?? session.token,
        ),
        expiresAt,
        userId: String(data.userId ?? session.userId),
      };

      return this.activeSession!;
    }, "refreshToken");
  }

  async logout(session: Session): Promise<void> {
    await this.executeWithRetry(async () => {
      try {
        const url = `${this.credentials!.baseUrl}${this.endpoints.logout}`;
        await this.httpClient.post(
          url,
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
      const url = `${this.credentials!.baseUrl}${this.endpoints.healthCheck}`;
      const response = await this.httpClient.get(url, { timeout: 5000 });
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

    if (!this.endpoints.downloadTranscriptPDF) {
      throw this.createError("PDF download endpoint not configured");
    }

    return this.executeWithRetry(async () => {
      const url = `${this.credentials!.baseUrl}${this.endpoints.downloadTranscriptPDF!.replace("{studentId}", studentId)}`;
      const response = await this.httpClient.get(url, {
        ...this.getAuthConfig(session),
        responseType: "arraybuffer",
      });

      return Buffer.from(response.data);
    }, `downloadTranscriptPDF(${studentId})`);
  }

  async submitEvaluation(
    session: Session,
    studentId: string,
    evaluationData: Record<string, unknown>,
  ): Promise<boolean> {
    this.validateSession(session);

    if (!this.endpoints.submitEvaluation) {
      throw this.createError("Evaluation submission endpoint not configured");
    }

    return this.executeWithRetry(async () => {
      const url = `${this.credentials!.baseUrl}${this.endpoints.submitEvaluation!.replace("{studentId}", studentId)}`;
      const response = await this.httpClient.post(
        url,
        evaluationData,
        this.getAuthConfig(session),
      );

      return response.status === 201 || response.status === 200;
    }, `submitEvaluation(${studentId})`);
  }

  private applyFieldMappings(
    data: Record<string, unknown>,
    mappings: FieldMapping[],
  ): Record<string, unknown> {
    if (!mappings || mappings.length === 0) return data;

    const result: Record<string, unknown> = {};

    for (const mapping of mappings) {
      const sourceValue = this.getNestedValue(data, mapping.source);
      result[mapping.target] = mapping.transform
        ? mapping.transform(sourceValue)
        : sourceValue;
    }

    return result;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce((current: unknown, key: string) => {
      if (current && typeof current === "object") {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  private unwrapResponse(data: unknown): Record<string, unknown> {
    if (!this.responseWrapperPath) {
      return data as Record<string, unknown>;
    }

    const result = this.getNestedValue(
      data as Record<string, unknown>,
      this.responseWrapperPath,
    );
    return (
      (result as Record<string, unknown>) || (data as Record<string, unknown>)
    );
  }

  private getAuthConfig(session: Session): AxiosRequestConfig {
    return {
      headers: {
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
        ...this.credentials?.additionalHeaders,
      },
      timeout: this.config.timeout,
    };
  }
}
