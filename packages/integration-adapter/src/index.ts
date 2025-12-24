export enum SISType {
  BANNER = "BANNER",
  PEOPLESOFT = "PEOPLESOFT",
  COLLEAGUE = "COLLEAGUE",
  JICS = "JICS",
  WORKDAY = "WORKDAY",
  CUSTOM = "CUSTOM",
}

export interface SISCredentials {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  additionalHeaders?: Record<string, string>;
}

export interface Session {
  sessionId: string;
  token: string;
  expiresAt: Date;
  userId?: string;
}

export interface GradeRecord {
  courseId: string;
  courseName: string;
  termCode: string;
  termName: string;
  creditHours: number;
  grade: string;
  gradePoints: number;
  isRepeat: boolean;
  isTransfer: boolean;
  earnedCredits: number;
  qualityPoints: number;
}

export interface Transcript {
  studentId: string;
  studentName: string;
  program: string;
  major: string;
  cumulativeGPA: number;
  totalCredits: number;
  earnedCredits: number;
  gradeRecords: GradeRecord[];
  lastUpdated: Date;
}

export interface CourseEnrollment {
  courseId: string;
  courseName: string;
  termCode: string;
  termName: string;
  status: "ENROLLED" | "DROPPED" | "WITHDRAWN" | "COMPLETED";
  creditHours: number;
  enrollmentDate: Date;
}

export interface StudentInfo {
  studentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  program: string;
  major: string;
  concentration?: string;
  academicStanding: "GOOD" | "PROBATION" | "SUSPENDED" | "DISMISSED";
  currentTerm: string;
  advisorId?: string;
}

export interface CourseInfo {
  courseId: string;
  courseName: string;
  department: string;
  credits: number;
  description?: string;
  prerequisites?: string[];
  corequisites?: string[];
}

export interface SISAdapter {
  sisType: SISType;

  authenticate(credentials: SISCredentials): Promise<Session>;

  getStudentInfo(session: Session, studentId: string): Promise<StudentInfo>;

  getTranscript(session: Session, studentId: string): Promise<Transcript>;

  getCurrentEnrollments(
    session: Session,
    studentId: string,
  ): Promise<CourseEnrollment[]>;

  getCourseInfo(session: Session, courseId: string): Promise<CourseInfo>;

  validateStudent(session: Session, studentId: string): Promise<boolean>;

  checkHold(session: Session, studentId: string): Promise<boolean>;

  getGradeRecords(
    session: Session,
    studentId: string,
    termCode?: string,
  ): Promise<GradeRecord[]>;

  refreshToken(session: Session): Promise<Session>;

  logout(session: Session): Promise<void>;

  healthCheck(): Promise<boolean>;
}

export type { AdapterConfig, RequestLog } from "./base-adapter";
export { BaseSISAdapter } from "./base-adapter";

export { BannerAdapter } from "./banner-adapter";

export { PeopleSoftAdapter } from "./peoplesoft-adapter";

export { ColleagueAdapter } from "./colleague-adapter";

export type {
  FieldMapping,
  EndpointConfig,
  CustomRestAdapterConfig,
} from "./custom-rest-adapter";
export { CustomRestAdapter } from "./custom-rest-adapter";

export type {
  SFTPCredentials,
  FileFormat,
  SFTPAdapterConfig,
} from "./sftp-adapter";
export { SFTPAdapter } from "./sftp-adapter";

export { AdapterFactory, getAdapter } from "./factory";
