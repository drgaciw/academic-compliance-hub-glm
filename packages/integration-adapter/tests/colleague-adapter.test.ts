import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ColleagueAdapter } from "../src/colleague-adapter";
import axios, { AxiosInstance } from "axios";
import { SISType } from "../src/index";

vi.mock("axios");

describe("H2-003-003: Colleague Adapter Integration Tests", () => {
  let adapter: ColleagueAdapter;
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
    adapter = new ColleagueAdapter({
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
          sessionId: "session-abc",
          userId: "user-xyz",
        },
      };

      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        data: mockResponse.data,
      });

      const credentials = {
        baseUrl: "https://colleague.example.com",
        apiKey: "colleague-api-key",
      };

      const session = await adapter.authenticate(credentials);

      expect(session.token).toBe("test-token");
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/auth/login"),
          headers: expect.objectContaining({
            "X-API-KEY": "colleague-api-key",
          }),
        }),
      );
    });
  });

  describe("Student Information", () => {
    it("should get student info", async () => {
      const mockSession = {
        sessionId: "session-abc",
        token: "test-token",
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockStudentData = {
        studentId: "STU-123",
        firstName: "Robert",
        lastName: "Johnson",
        email: "robert@example.com",
        program: "BSENG",
        major: "Engineering",
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockStudentData,
      });

      const studentInfo = await adapter.getStudentInfo(mockSession, "STU-123");

      expect(studentInfo.studentId).toBe("STU-123");
      expect(studentInfo.firstName).toBe("Robert");
    });
  });

  describe("Transcript", () => {
    it("should get student transcript", async () => {
      const mockSession = {
        sessionId: "session-abc",
        token: "test-token",
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockTranscriptData = {
        studentId: "STU-123",
        studentName: "Robert Johnson",
        program: "BSENG",
        major: "Engineering",
        cumulativeGPA: 3.2,
        totalCredits: 90,
        earnedCredits: 90,
        gradeRecords: [],
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockTranscriptData,
      });

      const transcript = await adapter.getTranscript(mockSession, "STU-123");

      expect(transcript.studentId).toBe("STU-123");
      expect(transcript.cumulativeGPA).toBe(3.2);
    });
  });

  describe("Health Check", () => {
    it("should pass health check", async () => {
      mockAxiosInstance.get.mockResolvedValue({ status: 200 });

      const isHealthy = await adapter.healthCheck();

      expect(isHealthy).toBe(true);
    });
  });

  it("should have correct SIS type", () => {
    expect(adapter.sisType).toBe(SISType.COLLEAGUE);
  });
});
