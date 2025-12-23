import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PeopleSoftAdapter } from "../src/peoplesoft-adapter";
import axios from "axios";
import { SISType } from "../src/index";

vi.mock("axios");

describe("H2-003-002: PeopleSoft Adapter Integration Tests", () => {
  let adapter: PeopleSoftAdapter;
  let mockAxiosInstance: any;

  beforeEach(() => {
    adapter = new PeopleSoftAdapter({
      maxRetries: 2,
      timeout: 5000,
    });
    mockAxiosInstance = axios.create();
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication", () => {
    it("should authenticate with API key", async () => {
      const mockResponse = {
        data: {
          access_token: "test-token",
          JSESSIONID: "jsession-123",
          userId: "user-456",
        },
      };

      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        data: mockResponse.data,
      });

      const credentials = {
        baseUrl: "https://peoplesoft.example.com",
        apiKey: "test-api-key",
      };

      const session = await adapter.authenticate(credentials);

      expect(session.token).toBe("test-token");
      expect(session.sessionId).toBe("jsession-123");
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "post",
          url: "https://peoplesoft.example.com/PSFT_HR/psapi.svc/v1/login",
          headers: expect.objectContaining({
            "X-API-KEY": "test-api-key",
          }),
        }),
      );
    });

    it("should authenticate with client credentials", async () => {
      const mockResponse = {
        data: {
          access_token: "test-token",
          JSESSIONID: "jsession-123",
        },
      };

      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        data: mockResponse.data,
      });

      const credentials = {
        baseUrl: "https://peoplesoft.example.com",
        clientId: "client-id",
        clientSecret: "client-secret",
      };

      const session = await adapter.authenticate(credentials);

      expect(session.token).toBe("test-token");
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            client_id: "client-id",
            client_secret: "client-secret",
          },
        }),
      );
    });

    it("should handle authentication errors with retry", async () => {
      mockAxiosInstance.request
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          status: 200,
          data: { JSESSIONID: "retry-session", token: "retry-token" },
        });

      const credentials = {
        baseUrl: "https://peoplesoft.example.com",
        apiKey: "test-key",
      };

      const session = await adapter.authenticate(credentials);

      expect(session.token).toBe("retry-token");
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });
  });

  describe("Student Information", () => {
    it("should get student info with PeopleSoft field names", async () => {
      const mockSession = {
        sessionId: "jsession-123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 7200000),
      };

      const mockStudentData = {
        EMPLID: "12345",
        FIRST_NAME: "Jane",
        LAST_NAME: "Smith",
        EMAIL_ADDR: "jane@example.com",
        ACAD_PROG: "BSBA",
        ACAD_PLAN: "Business Admin",
        STRM: "202401",
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockStudentData,
      });

      const studentInfo = await adapter.getStudentInfo(mockSession, "12345");

      expect(studentInfo.studentId).toBe("12345");
      expect(studentInfo.firstName).toBe("Jane");
      expect(studentInfo.lastName).toBe("Smith");
      expect(studentInfo.program).toBe("BSBA");
    });
  });

  describe("Transcript", () => {
    it("should get student transcript with PeopleSoft field names", async () => {
      const mockSession = {
        sessionId: "jsession-123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 7200000),
      };

      const mockTranscriptData = {
        EMPLID: "12345",
        NAME: "Jane Smith",
        ACAD_PROG: "BSBA",
        ACAD_PLAN: "Business Admin",
        CUM_GPA: 3.7,
        TOT_CUM_TAKEN: 120,
        TOT_CUM_EARNED: 120,
        GRADES: [],
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockTranscriptData,
      });

      const transcript = await adapter.getTranscript(mockSession, "12345");

      expect(transcript.studentId).toBe("12345");
      expect(transcript.studentName).toBe("Jane Smith");
      expect(transcript.cumulativeGPA).toBe(3.7);
    });
  });

  describe("Enrollments", () => {
    it("should get current enrollments with PeopleSoft field names", async () => {
      const mockSession = {
        sessionId: "jsession-123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 7200000),
      };

      const mockEnrollments = {
        ENROLLMENTS: [
          {
            CRSE_ID: "MKTG-301",
            CRSE_TITLE: "Marketing Principles",
            STRM: "202401",
            ENRL_STATUS: "ENRL",
            UNITS_TAKEN: 3,
          },
        ],
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockEnrollments,
      });

      const enrollments = await adapter.getCurrentEnrollments(
        mockSession,
        "12345",
      );

      expect(enrollments).toHaveLength(1);
      expect(enrollments[0].courseId).toBe("MKTG-301");
      expect(enrollments[0].termCode).toBe("202401");
    });
  });

  describe("Health Check", () => {
    it("should pass health check", async () => {
      mockAxiosInstance.get.mockResolvedValue({ status: 200 });

      const isHealthy = await adapter.healthCheck();

      expect(isHealthy).toBe(true);
    });

    it("should fail health check on error", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("Service unavailable"));

      const isHealthy = await adapter.healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe("Webhooks", () => {
    it("should register webhook", async () => {
      mockAxiosInstance.post.mockResolvedValue({ status: 201 });

      const registered = await adapter.registerWebhook(
        "https://webhook.example.com",
        ["student.enrolled", "grade.posted"],
      );

      expect(registered).toBe(true);
    });

    it("should handle webhook events", async () => {
      const webhookData = {
        eventId: "evt-456",
        eventType: "student.enrolled",
        studentId: "12345",
        timestamp: new Date(),
        data: {},
      };

      await adapter.handleWebhook(webhookData);

      expect(adapter.getLogs().length).toBeGreaterThan(0);
    });
  });

  describe("Grade Records", () => {
    it("should get grade records with PeopleSoft field names", async () => {
      const mockSession = {
        sessionId: "jsession-123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 7200000),
      };

      const mockGrades = {
        GRADES: [
          {
            CRSE_ID: "MKTG-301",
            CRSE_TITLE: "Marketing Principles",
            STRM: "202401",
            GRDE: "A",
            GRDE_POINTS: 4.0,
            UNITS_TAKEN: 3,
            UNITS_EARNED: 3,
            QUALITY_POINTS: 12.0,
          },
        ],
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockGrades,
      });

      const grades = await adapter.getGradeRecords(mockSession, "12345");

      expect(grades).toHaveLength(1);
      expect(grades[0].grade).toBe("A");
      expect(grades[0].gradePoints).toBe(4.0);
    });

    it("should get grade records for specific term with STRM parameter", async () => {
      const mockSession = {
        sessionId: "jsession-123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 7200000),
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { GRADES: [] },
      });

      await adapter.getGradeRecords(mockSession, "12345", "202401");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining("?STRM=202401"),
        expect.anything(),
      );
    });
  });

  it("should have correct SIS type", () => {
    expect(adapter.sisType).toBe(SISType.PEOPLESOFT);
  });
});
