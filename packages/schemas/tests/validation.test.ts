import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  CourseRecommendationInputSchema,
  CourseRecommendationSchema,
  ComplianceAnalysisInputSchema,
  ComplianceConcernSchema,
  TransferCreditInputSchema,
  AcademicPerformanceInputSchema,
} from "../src/api/ai";
import {
  FilterSchema,
  SortSchema,
  ListQuerySchema,
  BulkActionInputSchema,
  ExportInputSchema,
  ValidationErrorSchema,
  APIErrorSchema,
} from "../src/api/common";
import {
  IDSchema,
  EmailSchema,
  PhoneSchema,
  URLSchema,
  PaginationSchema,
} from "../src/base";

describe("Base Schemas Validation", () => {
  describe("IDSchema", () => {
    it("should validate valid CUIDs", () => {
      const result = IDSchema.safeParse("clh123abc456def789");
      expect(result.success).toBe(true);
    });

    it("should reject invalid CUIDs", () => {
      const result = IDSchema.safeParse("not-a-cuid");
      expect(result.success).toBe(false);
    });
  });

  describe("EmailSchema", () => {
    it("should validate valid email addresses", () => {
      const result = EmailSchema.safeParse("user@example.com");
      expect(result.success).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      const result = EmailSchema.safeParse("not-an-email");
      expect(result.success).toBe(false);
    });
  });

  describe("PhoneSchema", () => {
    it("should validate valid phone numbers", () => {
      expect(PhoneSchema.safeParse("+1 (555) 123-4567").success).toBe(true);
      expect(PhoneSchema.safeParse("555-123-4567").success).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(PhoneSchema.safeParse("abc").success).toBe(false);
    });
  });

  describe("URLSchema", () => {
    it("should validate valid URLs", () => {
      const result = URLSchema.safeParse("https://example.com");
      expect(result.success).toBe(true);
    });

    it("should reject invalid URLs", () => {
      const result = URLSchema.safeParse("not-a-url");
      expect(result.success).toBe(false);
    });
  });

  describe("PaginationSchema", () => {
    it("should validate pagination parameters with defaults", () => {
      const result = PaginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should validate pagination parameters with values", () => {
      const result = PaginationSchema.safeParse({ page: 2, limit: 50 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it("should reject invalid pagination parameters", () => {
      expect(PaginationSchema.safeParse({ page: 0 }).success).toBe(false);
      expect(PaginationSchema.safeParse({ limit: 101 }).success).toBe(false);
    });
  });
});

describe("API Schemas Validation", () => {
  describe("FilterSchema", () => {
    it("should validate valid filter", () => {
      const result = FilterSchema.safeParse({
        field: "name",
        operator: "eq",
        value: "John",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid operator", () => {
      const result = FilterSchema.safeParse({
        field: "name",
        operator: "invalid",
        value: "John",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("SortSchema", () => {
    it("should validate valid sort", () => {
      const result = SortSchema.safeParse({
        field: "createdAt",
        order: "desc",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid order", () => {
      const result = SortSchema.safeParse({
        field: "createdAt",
        order: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ListQuerySchema", () => {
    it("should validate list query with defaults", () => {
      const result = ListQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate list query with parameters", () => {
      const result = ListQuerySchema.safeParse({
        filters: [{ field: "status", operator: "eq", value: "active" }],
        sort: [{ field: "createdAt", order: "desc" }],
        pagination: { page: 2, limit: 30 },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("BulkActionInputSchema", () => {
    it("should validate bulk action input", () => {
      const result = BulkActionInputSchema.safeParse({
        ids: ["id1", "id2", "id3"],
        action: "delete",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty ids array", () => {
      const result = BulkActionInputSchema.safeParse({
        ids: [],
        action: "delete",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ExportInputSchema", () => {
    it("should validate export input", () => {
      const result = ExportInputSchema.safeParse({
        format: "csv",
        filters: [{ field: "status", operator: "eq", value: "active" }],
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid format", () => {
      const result = ExportInputSchema.safeParse({
        format: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ValidationErrorSchema", () => {
    it("should validate validation error", () => {
      const result = ValidationErrorSchema.safeParse({
        field: "email",
        message: "Invalid email format",
        code: "INVALID_EMAIL",
        value: "not-an-email",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("APIErrorSchema", () => {
    it("should validate API error", () => {
      const result = APIErrorSchema.safeParse({
        code: "NOT_FOUND",
        message: "Resource not found",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid error code", () => {
      const result = APIErrorSchema.safeParse({
        code: "INVALID_CODE",
        message: "Error message",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("AI Schemas Validation", () => {
  describe("CourseRecommendationInputSchema", () => {
    it("should validate valid course recommendation input", () => {
      const result = CourseRecommendationInputSchema.safeParse({
        completedCourses: [
          {
            code: "MATH101",
            name: "Calculus I",
            credits: 4,
            grade: "A",
          },
        ],
        currentGPA: 3.5,
        totalCredits: 60,
        targetGPA: 3.7,
        requiredCredits: 120,
        concentration: "Computer Science",
        electivePreferences: ["AI", "Data Science"],
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid GPA", () => {
      const result = CourseRecommendationInputSchema.safeParse({
        completedCourses: [],
        currentGPA: 5.0,
        totalCredits: 60,
        requiredCredits: 120,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("CourseRecommendationSchema", () => {
    it("should validate valid course recommendation", () => {
      const result = CourseRecommendationSchema.safeParse({
        id: "1",
        code: "CS201",
        name: "Data Structures",
        credits: 4,
        reason: "Fulfills major requirement",
        difficulty: "moderate",
        fulfillsRequirement: true,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid difficulty", () => {
      const result = CourseRecommendationSchema.safeParse({
        id: "1",
        code: "CS201",
        name: "Data Structures",
        credits: 4,
        reason: "Fulfills major requirement",
        difficulty: "invalid",
        fulfillsRequirement: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ComplianceAnalysisInputSchema", () => {
    it("should validate valid compliance analysis input", () => {
      const result = ComplianceAnalysisInputSchema.safeParse({
        studentId: "student123",
        sport: "Basketball",
        division: "I",
        enrollmentData: {
          creditsEnrolled: 15,
          creditsCompleted: 60,
          term: "Fall 2024",
        },
        courseHistory: [
          {
            code: "MATH101",
            credits: 4,
            grade: "A",
            term: "Fall 2023",
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid division", () => {
      const result = ComplianceAnalysisInputSchema.safeParse({
        studentId: "student123",
        sport: "Basketball",
        division: "IV",
        enrollmentData: {
          creditsEnrolled: 15,
          creditsCompleted: 60,
          term: "Fall 2024",
        },
        courseHistory: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ComplianceConcernSchema", () => {
    it("should validate valid compliance concern", () => {
      const result = ComplianceConcernSchema.safeParse({
        category: "credits",
        severity: "high",
        description: "Credit hour deficiency",
        recommendation: "Enroll in additional credits",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid severity", () => {
      const result = ComplianceConcernSchema.safeParse({
        category: "credits",
        severity: "invalid",
        description: "Credit hour deficiency",
        recommendation: "Enroll in additional credits",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("TransferCreditInputSchema", () => {
    it("should validate valid transfer credit input", () => {
      const result = TransferCreditInputSchema.safeParse({
        sourceInstitution: "Community College",
        sourceCourses: [
          {
            code: "ENG101",
            name: "English Composition",
            credits: 3,
            description: "Writing course",
          },
        ],
        destinationInstitution: "State University",
        targetProgram: "Computer Science",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("AcademicPerformanceInputSchema", () => {
    it("should validate valid academic performance input", () => {
      const result = AcademicPerformanceInputSchema.safeParse({
        gpa: 3.8,
        credits: 15,
        semester: "Fall 2024",
        courses: [
          {
            grade: "A",
            credits: 4,
            name: "Calculus I",
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid GPA", () => {
      const result = AcademicPerformanceInputSchema.safeParse({
        gpa: 4.5,
        credits: 15,
        semester: "Fall 2024",
        courses: [],
      });
      expect(result.success).toBe(false);
    });
  });
});
