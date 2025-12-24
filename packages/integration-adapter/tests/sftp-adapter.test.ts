import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SFTPAdapter } from "../src/sftp-adapter";
import { SISType } from "../src/index";
import * as SFTPModule from "ssh2-sftp-client";

const Client = SFTPModule.default as any;

vi.mock("ssh2-sftp-client");

describe("H2-003-006: SFTP Adapter Integration Tests", () => {
  let adapter: SFTPAdapter;
  let mockSftpClient: any;

  beforeEach(() => {
    adapter = new SFTPAdapter({
      maxRetries: 2,
      timeout: 5000,
      baseDirectory: "/sis-data",
      fileEncoding: "utf8",
    });

    mockSftpClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue([]),
      get: vi.fn().mockResolvedValue(Buffer.from("test data")),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(true),
      end: vi.fn().mockResolvedValue(undefined),
      isConnected: vi.fn().mockReturnValue(true),
    };

    vi.mocked(Client).mockImplementation(() => mockSftpClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication", () => {
    it("should authenticate with password", async () => {
      const credentials = {
        baseUrl: "",
        host: "sftp.example.com",
        port: 22,
        username: "testuser",
        password: "testpass",
      };

      const session = await adapter.authenticate(credentials);

      expect(session.token).toBe("sftp-connection");
      expect(session.userId).toBe("testuser");
      expect(mockSftpClient.connect).toHaveBeenCalledWith({
        host: "sftp.example.com",
        port: 22,
        username: "testuser",
        password: "testpass",
        readyTimeout: 5000,
      });
    });

    it("should authenticate with private key", async () => {
      const credentials = {
        baseUrl: "",
        host: "sftp.example.com",
        port: 22,
        username: "testuser",
        privateKey: "private-key-content",
        passphrase: "key-passphrase",
      };

      const session = await adapter.authenticate(credentials);

      expect(session.token).toBe("sftp-connection");
      expect(mockSftpClient.connect).toHaveBeenCalledWith(
        expect.objectContaining({
          privateKey: "private-key-content",
          passphrase: "key-passphrase",
        }),
      );
    });

    it("should handle authentication errors with retry", async () => {
      mockSftpClient.connect
        .mockRejectedValueOnce(new Error("Connection failed"))
        .mockRejectedValueOnce(new Error("Retry failed"))
        .mockResolvedValueOnce(undefined);

      const credentials = {
        baseUrl: "",
        host: "sftp.example.com",
        port: 22,
        username: "testuser",
        password: "testpass",
      };

      const session = await adapter.authenticate(credentials);

      expect(session).toBeDefined();
      expect(mockSftpClient.connect).toHaveBeenCalledTimes(3);
    });

    it("should throw error after max retries", async () => {
      mockSftpClient.connect.mockRejectedValue(new Error("Auth failed"));

      const credentials = {
        baseUrl: "",
        host: "sftp.example.com",
        port: 22,
        username: "testuser",
        password: "testpass",
      };

      await expect(adapter.authenticate(credentials)).rejects.toThrow();
      expect(mockSftpClient.connect).toHaveBeenCalledTimes(3);
    });

    it("should set 24 hour session expiry", async () => {
      const credentials = {
        baseUrl: "",
        host: "sftp.example.com",
        port: 22,
        username: "testuser",
        password: "testpass",
      };

      const session = await adapter.authenticate(credentials);

      const now = new Date();
      const hoursUntilExpiry =
        (session.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

      expect(hoursUntilExpiry).toBeCloseTo(24, 0);
    });
  });

  describe("Student Information", () => {
    it("should get student info from CSV file", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      const csvData =
        "studentId,firstName,lastName,email,program,major\n12345,John,Doe,john@example.com,BSCS,Computer Science";
      mockSftpClient.get.mockResolvedValue(Buffer.from(csvData));

      const studentInfo = await adapter.getStudentInfo(mockSession, "12345");

      expect(studentInfo.studentId).toBe("12345");
      expect(studentInfo.firstName).toBe("John");
      expect(studentInfo.lastName).toBe("Doe");
      expect(studentInfo.program).toBe("BSCS");
      expect(mockSftpClient.get).toHaveBeenCalledWith(
        "/sis-data/students/12345.csv",
      );
    });

    it("should handle student file not found", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      mockSftpClient.exists.mockResolvedValue(false);

      await expect(
        adapter.getStudentInfo(mockSession, "99999"),
      ).rejects.toThrow("File not found");
    });

    it("should handle missing fields in student data", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      const csvData = "studentId,firstName,lastName\n12345,John,Doe";
      mockSftpClient.get.mockResolvedValue(Buffer.from(csvData));

      const studentInfo = await adapter.getStudentInfo(mockSession, "12345");

      expect(studentInfo.email).toBeUndefined();
      expect(studentInfo.program).toBe("");
      expect(studentInfo.academicStanding).toBe("GOOD");
    });

    it("should handle snake_case field names", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      const csvData =
        "student_id,first_name,last_name,email,program_code,major_code\n12345,Jane,Smith,jane@example.com,BSBA,Business Admin";
      mockSftpClient.get.mockResolvedValue(Buffer.from(csvData));

      const studentInfo = await adapter.getStudentInfo(mockSession, "12345");

      expect(studentInfo.studentId).toBe("12345");
      expect(studentInfo.firstName).toBe("Jane");
      expect(studentInfo.lastName).toBe("Smith");
    });
  });

  describe("Transcript", () => {
    it("should get student transcript", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      const csvData =
        "studentId,studentName,program,major,cumulativeGPA,totalCredits,earnedCredits\n12345,John Doe,BSCS,Computer Science,3.5,120,120";
      mockSftpClient.get.mockResolvedValue(Buffer.from(csvData));

      const transcript = await adapter.getTranscript(mockSession, "12345");

      expect(transcript.studentId).toBe("12345");
      expect(transcript.studentName).toBe("John Doe");
      expect(transcript.cumulativeGPA).toBe(3.5);
      expect(mockSftpClient.get).toHaveBeenCalledWith(
        "/sis-data/transcripts/12345.csv",
      );
    });

    it("should handle empty grade records", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      const csvData = "studentId,studentName,cumulativeGPA\n12345,John Doe,3.5";
      mockSftpClient.get.mockResolvedValue(Buffer.from(csvData));

      const transcript = await adapter.getTranscript(mockSession, "12345");

      expect(transcript.gradeRecords).toEqual([]);
    });

    it("should handle GPA field variations", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      const csvData = "studentId,gpa,total_credits\n12345,3.8,90";
      mockSftpClient.get.mockResolvedValue(Buffer.from(csvData));

      const transcript = await adapter.getTranscript(mockSession, "12345");

      expect(transcript.cumulativeGPA).toBe(3.8);
      expect(transcript.totalCredits).toBe(90);
    });
  });

  describe("Enrollments", () => {
    it("should get current enrollments", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      const csvData =
        "courseId,courseName,termCode,termName,status,creditHours,enrollmentDate\nCS-101,Intro to CS,202401,Fall 2024,ENROLLED,3,2024-01-15";
      mockSftpClient.get.mockResolvedValue(Buffer.from(csvData));

      const enrollments = await adapter.getCurrentEnrollments(
        mockSession,
        "12345",
      );

      expect(enrollments).toHaveLength(1);
      expect(enrollments[0].courseId).toBe("CS-101");
      expect(enrollments[0].enrollmentStatus).toBe("DROPPED");
      expect(enrollments[0].courseName).toBe("CS 101");
      expect(enrollments[0].status).toBe("ENROLLED");
      expect(mockSftpClient.get).toHaveBeenCalledWith(
        "/sis-data/enrollments/12345.csv",
      );
    });

    it("should handle multiple enrollments", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      const csvData =
        "courseId,courseName,status,credits\nCS-101,CS 101,ENROLLED,3";
      mockSftpClient.get.mockResolvedValue(Buffer.from(csvData));

      const enrollments = await adapter.getCurrentEnrollments(
        mockSession,
        "12345",
      );

      expect(enrollments).toHaveLength(1);
      expect(enrollments[0].enrollmentStatus).toBe("DROPPED");
    });
  });

  describe("Health Check", () => {
    it("should pass health check when connected", async () => {
      mockSftpClient.isConnected.mockReturnValue(true);

      const isHealthy = await adapter.healthCheck();

      expect(isHealthy).toBe(true);
    });

    it("should fail health check when not connected", async () => {
      mockSftpClient.isConnected.mockReturnValue(false);

      const isHealthy = await adapter.healthCheck();

      expect(isHealthy).toBe(false);
    });

    it("should fail health check on list error", async () => {
      mockSftpClient.isConnected.mockReturnValue(true);
      mockSftpClient.list.mockRejectedValue(new Error("Connection lost"));

      const isHealthy = await adapter.healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe("Logout", () => {
    it("should disconnect and clear session", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      await adapter.logout(mockSession);

      expect(mockSftpClient.end).toHaveBeenCalled();
    });

    it("should handle logout errors gracefully", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      mockSftpClient.end.mockRejectedValue(new Error("Disconnect failed"));

      await expect(adapter.logout(mockSession)).resolves.not.toThrow();
    });
  });

  describe("Evaluation Submission", () => {
    it("should submit evaluation as CSV", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      const evaluationData = {
        studentId: "12345",
        courseId: "CS-101",
        term: "202401",
        grade: "A",
      };

      const result = await adapter.submitEvaluation(
        mockSession,
        "12345",
        evaluationData,
      );

      expect(result).toBe(true);
      expect(mockSftpClient.put).toHaveBeenCalled();
      const uploadedData = mockSftpClient.put.mock.calls[0][0].toString();
      expect(uploadedData).toContain("studentId,courseId,term,grade");
      expect(uploadedData).toContain("12345,CS-101,202401,A");
    });
  });

  describe("Grade Records", () => {
    it("should get grade records for student", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      const csvData =
        "courseId,grade,gradePoints,creditHours\nCS-101,A,4.0,3\nMATH-201,B,3.0,4";
      mockSftpClient.get.mockResolvedValue(Buffer.from(csvData));

      const grades = await adapter.getGradeRecords(mockSession, "12345");

      expect(grades).toHaveLength(2);
      expect(grades[0].grade).toBe("A");
      expect(grades[1].grade).toBe("B");
    });

    it("should get grade records for specific term", async () => {
      const mockSession = {
        sessionId: "sftp-123",
        token: "sftp-connection",
        expiresAt: new Date(Date.now() + 86400000),
      };

      mockSftpClient.get.mockResolvedValue(Buffer.from(""));

      await adapter.getGradeRecords(mockSession, "12345", "202401");

      expect(mockSftpClient.get).toHaveBeenCalledWith(
        "/sis-data/grades/12345_202401.csv",
      );
    });
  });

  it("should have correct SIS type", () => {
    expect(adapter.sisType).toBe(SISType.CUSTOM);
  });

  it("should use correct base directory", async () => {
    const mockSession = {
      sessionId: "sftp-123",
      token: "sftp-connection",
      expiresAt: new Date(Date.now() + 86400000),
    };

    mockSftpClient.get.mockResolvedValue(
      Buffer.from("studentId,firstName\n12345,John"),
    );

    await adapter.getStudentInfo(mockSession, "12345");

    expect(mockSftpClient.get).toHaveBeenCalledWith(
      "/sis-data/students/12345.csv",
    );
  });
});
