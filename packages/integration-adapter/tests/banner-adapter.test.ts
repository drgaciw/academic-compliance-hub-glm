import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { BannerAdapter } from "../src/banner-adapter";
import axios, { AxiosInstance } from "axios";
import { SISType } from "../src/index";

vi.mock("axios");

describe("H2-003-001: Banner Adapter Integration Tests", () => {
  let adapter: BannerAdapter;
  let mockAxiosInstance: AxiosInstance & {
    request: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockAxiosInstance = {
      request: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as any;

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance);
    adapter = new BannerAdapter({
      maxRetries: 2,
      timeout: 5000,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication", () => {
    it("should authenticate with API key", async () => {
      const mockResponse = {
        data: {
          access_token: "test-token",
          sessionId: "session-123",
          userId: "user-456",
        },
      };

      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        data: mockResponse.data,
      });

      const credentials = {
        baseUrl: "https://banner.example.com",
        apiKey: "test-api-key",
      };

      const session = await adapter.authenticate(credentials);

      expect(session.token).toBe("test-token");
      expect(session.sessionId).toBe("session-123");
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "post",
          url: "https://banner.example.com/auth/login",
          headers: expect.objectContaining({
            "X-API-KEY": "test-api-key",
          }),
        }),
      );
    });

    it("should authenticate with username/password", async () => {
      const mockResponse = {
        data: {
          token: "test-token",
          sessionId: "session-123",
        },
      };

      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        data: mockResponse.data,
      });

      const credentials = {
        baseUrl: "https://banner.example.com",
        username: "testuser",
        password: "testpass",
      };

      const session = await adapter.authenticate(credentials);

      expect(session.token).toBe("test-token");
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            username: "testuser",
            password: "testpass",
          },
        }),
      );
    });

    it("should handle authentication errors with retry", async () => {
      mockAxiosInstance.request
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          status: 200,
          data: { token: "retry-token" },
        });

      const credentials = {
        baseUrl: "https://banner.example.com",
        apiKey: "test-key",
      };

      const session = await adapter.authenticate(credentials);

      expect(session.token).toBe("retry-token");
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });

    it("should throw error after max retries", async () => {
      mockAxiosInstance.request.mockRejectedValue(new Error("Auth failed"));

      const credentials = {
        baseUrl: "https://banner.example.com",
        apiKey: "test-key",
      };

      await expect(adapter.authenticate(credentials)).rejects.toThrow();
    });
  });

  describe("Student Information", () => {
    it("should get student info", async () => {
      const mockSession = {
        sessionId: "session-123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockStudentData = {
        studentId: "12345",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        program: "BSCS",
        major: "Computer Science",
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockStudentData,
      });

      const studentInfo = await adapter.getStudentInfo(mockSession, "12345");

      expect(studentInfo.studentId).toBe("12345");
      expect(studentInfo.firstName).toBe("John");
      expect(studentInfo.lastName).toBe("Doe");
    });

    it("should handle invalid session", async () => {
      const expiredSession = {
        sessionId: "session-123",
        token: "test-token",
        expiresAt: new Date(Date.now() - 1000),
      };

      await expect(
        adapter.getStudentInfo(expiredSession, "12345"),
      ).rejects.toThrow("Session has expired");
    });
  });

  describe("Transcript", () => {
    it("should get student transcript", async () => {
      const mockSession = {
        sessionId: "session-123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockTranscriptData = {
        studentId: "12345",
        studentName: "John Doe",
        program: "BSCS",
        major: "Computer Science",
        cumulativeGPA: 3.5,
        totalCredits: 120,
        earnedCredits: 120,
        gradeRecords: [],
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockTranscriptData,
      });

      const transcript = await adapter.getTranscript(mockSession, "12345");

      expect(transcript.studentId).toBe("12345");
      expect(transcript.cumulativeGPA).toBe(3.5);
    });
  });

  describe("Enrollments", () => {
    it("should get current enrollments", async () => {
      const mockSession = {
        sessionId: "session-123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockEnrollments = {
        enrollments: [
          {
            courseId: "CS-101",
            courseName: "Introduction to CS",
            termCode: "202401",
            status: "ENROLLED",
            creditHours: 3,
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
      expect(enrollments[0].courseId).toBe("CS-101");
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
        ["student.updated", "grade.updated"],
      );

      expect(registered).toBe(true);
    });

    it("should handle webhook events", async () => {
      const webhookData = {
        eventId: "evt-123",
        eventType: "student.updated",
        studentId: "12345",
        timestamp: new Date(),
        data: {},
      };

      await adapter.handleWebhook(webhookData);

      expect(adapter.getLogs().length).toBeGreaterThan(0);
    });
  });

  describe("Grade Records", () => {
    it("should get grade records", async () => {
      const mockSession = {
        sessionId: "session-123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockGrades = {
        grades: [
          {
            courseId: "CS-101",
            grade: "A",
            gradePoints: 4.0,
            creditHours: 3,
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
    });

    it("should get grade records for specific term", async () => {
      const mockSession = {
        sessionId: "session-123",
        token: "test-token",
        expiresAt: new Date(Date.now() + 3600000),
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { grades: [] },
      });

      await adapter.getGradeRecords(mockSession, "12345", "202401");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining("?term=202401"),
        expect.anything(),
      );
    });
  });

  it("should have correct SIS type", () => {
    expect(adapter.sisType).toBe(SISType.BANNER);
  });
});
