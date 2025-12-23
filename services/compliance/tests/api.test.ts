import { describe, it, expect } from "@jest/globals";
import app from "../src/index";

describe("Compliance Service API Tests", () => {
  describe("H2-002-008: Health Check", () => {
    it("should return 200 status", async () => {
      const response = await app.request("/health");
      expect(response.status).toBe(200);
    });

    it("should return service information", async () => {
      const response = await app.request("/health");
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.status).toBe("ok");
      expect(data.data.service).toBe("compliance");
    });
  });

  describe("H2-002-009: Get Student Compliance", () => {
    it("should return compliance status for student", async () => {
      const response = await app.request("/students/12345/compliance");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.studentId).toBe("12345");
    });

    it("should include GPA requirements", async () => {
      const response = await app.request("/students/12345/compliance");
      const data = await response.json();

      expect(data.data.gpaRequirement).toBeDefined();
      expect(data.data.gpaRequirement).toHaveProperty("current");
      expect(data.data.gpaRequirement).toHaveProperty("required");
    });

    it("should include credit requirements", async () => {
      const response = await app.request("/students/12345/compliance");
      const data = await response.json();

      expect(data.data.creditRequirement).toBeDefined();
      expect(data.data.creditRequirement).toHaveProperty("current");
      expect(data.data.creditRequirement).toHaveProperty("required");
    });

    it("should include progress percentage", async () => {
      const response = await app.request("/students/12345/compliance");
      const data = await response.json();

      expect(data.data.progress).toBeDefined();
      expect(typeof data.data.progress).toBe("number");
    });

    it("should handle invalid student ID", async () => {
      const response = await app.request("/students/invalid/compliance");
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("H2-002-010: Check NCAA Eligibility", () => {
    it("should return eligibility status", async () => {
      const response = await app.request("/students/12345/eligibility");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.eligible).toBeDefined();
    });

    it("should include last checked timestamp", async () => {
      const response = await app.request("/students/12345/eligibility");
      const data = await response.json();

      expect(data.data.lastChecked).toBeDefined();
      const date = new Date(data.data.lastChecked);
      expect(date).toBeInstanceOf(Date);
    });

    it("should include next check due date", async () => {
      const response = await app.request("/students/12345/eligibility");
      const data = await response.json();

      expect(data.data.nextCheckDue).toBeDefined();
    });
  });

  describe("H2-002-011: Create Compliance Record", () => {
    it("should create compliance record", async () => {
      const response = await app.request("/students/12345/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "ACADEMIC",
          requirement: "GPA Requirement",
          status: "COMPLETED",
          notes: "Met GPA requirement",
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.studentId).toBe("12345");
    });

    it("should validate status enum", async () => {
      const validStatuses = ["PENDING", "COMPLETED", "FAILED", "EXEMPTED"];

      for (const status of validStatuses) {
        const response = await app.request("/students/12345/compliance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: "ACADEMIC",
            requirement: "Test",
            status: status,
          }),
        });
        expect(response.status).toBe(201);
      }
    });

    it("should reject invalid status", async () => {
      const response = await app.request("/students/12345/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "ACADEMIC",
          requirement: "Test",
          status: "INVALID_STATUS",
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should require category", async () => {
      const response = await app.request("/students/12345/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirement: "Test",
          status: "COMPLETED",
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should require requirement", async () => {
      const response = await app.request("/students/12345/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "ACADEMIC",
          status: "COMPLETED",
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
