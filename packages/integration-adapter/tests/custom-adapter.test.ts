import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { CustomRestAdapter } from "../src/custom-rest-adapter";
import axios, { AxiosInstance } from "axios";
import { SISType } from "../src/index";

vi.mock("axios");

describe("H2-003-004: Custom REST Adapter Integration Tests", () => {
  let adapter: CustomRestAdapter;
  let mockAxiosInstance: AxiosInstance & {
    request: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };

  const config = {
    baseUrl: "https://custom-sis.example.com/api",
    endpoints: {
      getStudentInfo: "/students/{id}",
      getTranscript: "/students/{id}/transcript",
      getCurrentEnrollments: "/students/{id}/enrollments",
      getCourseInfo: "/courses/{id}",
    },
    fieldMappings: {
      studentInfo: [
        { source: "id", target: "studentId" },
        { source: "first_name", target: "firstName" },
        { source: "last_name", target: "lastName" },
        { source: "email_address", target: "email" },
        { source: "program_code", target: "program" },
        { source: "major_code", target: "major" },
      ],
    },
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
    adapter = new CustomRestAdapter({
      ...config,
      maxRetries: 2,
      timeout: 5000,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Configuration", () => {
    it("should load custom configuration", () => {
      const loadedConfig = adapter.getConfig();
      expect(loadedConfig).toBeDefined();
    });
  });

  describe("Authentication", () => {
    it("should authenticate with custom endpoint", async () => {
      const mockResponse = {
        data: {
          token: "custom-token",
          sessionId: "custom-session",
        },
      };

      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        data: mockResponse.data,
      });

      const credentials = {
        baseUrl: config.baseUrl,
        apiKey: "custom-api-key",
      };

      const session = await adapter.authenticate(credentials);

      expect(session.token).toBe("custom-token");
    });
  });

  describe("Student Information", () => {
    it("should get student info with field mapping", async () => {
      const mockSession = {
        sessionId: "custom-session",
        token: "custom-token",
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockStudentData = {
        id: "CUST-999",
        first_name: "Emily",
        last_name: "Davis",
        email_address: "emily@example.com",
        program_code: "BSART",
        major_code: "Art History",
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockStudentData,
      });

      const studentInfo = await adapter.getStudentInfo(mockSession, "CUST-999");

      expect(studentInfo.studentId).toBe("CUST-999");
      expect(studentInfo.firstName).toBe("Emily");
      expect(studentInfo.lastName).toBe("Davis");
    });
  });

  describe("Transcript", () => {
    it("should get student transcript from custom endpoint", async () => {
      const mockSession = {
        sessionId: "custom-session",
        token: "custom-token",
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockTranscriptData = {
        id: "CUST-999",
        name: "Emily Davis",
        program_code: "BSART",
        major_code: "Art History",
        cumulative_gpa: 3.8,
        total_credits: 60,
        earned_credits: 60,
        grades: [],
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockTranscriptData,
      });

      const transcript = await adapter.getTranscript(mockSession, "CUST-999");

      expect(transcript.studentId).toBe("CUST-999");
      expect(transcript.cumulativeGPA).toBe(3.8);
    });
  });

  describe("Enrollments", () => {
    it("should get current enrollments from custom endpoint", async () => {
      const mockSession = {
        sessionId: "custom-session",
        token: "custom-token",
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockEnrollments = [
        {
          course_code: "ART-201",
          title: "Art Appreciation",
          term: "2024FALL",
          status: "ACTIVE",
          credits: 3,
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockEnrollments,
      });

      const enrollments = await adapter.getCurrentEnrollments(
        mockSession,
        "CUST-999",
      );

      expect(enrollments).toHaveLength(1);
      expect(enrollments[0].courseId).toBe("ART-201");
    });
  });

  describe("Course Information", () => {
    it("should get course info from custom endpoint", async () => {
      const mockSession = {
        sessionId: "custom-session",
        token: "custom-token",
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockCourseData = {
        course_code: "ART-201",
        title: "Art Appreciation",
        department: "ART",
        credits: 3,
        description: "Introduction to visual arts",
      };

      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockCourseData,
      });

      const courseInfo = await adapter.getCourseInfo(mockSession, "ART-201");

      expect(courseInfo.courseId).toBe("ART-201");
      expect(courseInfo.courseName).toBe("Art Appreciation");
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
    expect(adapter.sisType).toBe(SISType.CUSTOM);
  });
});
