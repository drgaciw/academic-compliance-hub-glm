import { describe, it, expect } from "@jest/globals";
import app from "../src/index";

describe("AI Service API Tests", () => {
  describe("H2-002-021: Health Check", () => {
    it("should return 200 status", async () => {
      const response = await app.request("/health");
      expect(response.status).toBe(200);
    });

    it("should return service information", async () => {
      const response = await app.request("/health");
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.status).toBe("ok");
      expect(data.data.service).toBe("ai");
    });
  });

  describe("H2-002-022: Analyze Compliance", () => {
    it("should analyze compliance", async () => {
      const response = await app.request("/analyze/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "12345",
          sport: "FOOTBALL",
          academicYear: "2024",
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.studentId).toBe("12345");
    });

    it("should include eligibility status", async () => {
      const response = await app.request("/analyze/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "12345",
          sport: "FOOTBALL",
          academicYear: "2024",
        }),
      });
      const data = await response.json();

      expect(data.data.analysis).toBeDefined();
      expect(data.data.analysis.eligible).toBeDefined();
    });

    it("should include warnings", async () => {
      const response = await app.request("/analyze/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "12345",
          sport: "FOOTBALL",
          academicYear: "2024",
        }),
      });
      const data = await response.json();

      expect(data.data.analysis.warnings).toBeDefined();
      expect(data.data.analysis.warnings).toBeInstanceOf(Array);
    });

    it("should include recommendations", async () => {
      const response = await app.request("/analyze/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "12345",
          sport: "FOOTBALL",
          academicYear: "2024",
        }),
      });
      const data = await response.json();

      expect(data.data.analysis.recommendations).toBeDefined();
      expect(data.data.analysis.recommendations).toBeInstanceOf(Array);
    });

    it("should require studentId", async () => {
      const response = await app.request("/analyze/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport: "FOOTBALL",
          academicYear: "2024",
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should require sport", async () => {
      const response = await app.request("/analyze/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "12345",
          academicYear: "2024",
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should require academicYear", async () => {
      const response = await app.request("/analyze/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "12345",
          sport: "FOOTBALL",
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("H2-002-023: Recommend Courses", () => {
    it("should recommend courses", async () => {
      const response = await app.request("/recommend/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "12345",
          currentGPA: 3.2,
          completedCredits: 45,
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.studentId).toBe("12345");
    });

    it("should return array of recommendations", async () => {
      const response = await app.request("/recommend/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "12345",
          currentGPA: 3.2,
          completedCredits: 45,
        }),
      });
      const data = await response.json();

      expect(data.data.recommendations).toBeInstanceOf(Array);
      expect(data.data.recommendations.length).toBeGreaterThan(0);
    });

    it("should include course code", async () => {
      const response = await app.request("/recommend/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "12345",
          currentGPA: 3.2,
          completedCredits: 45,
        }),
      });
      const data = await response.json();

      expect(data.data.recommendations[0]).toHaveProperty("code");
    });

    it("should include course name", async () => {
      const response = await app.request("/recommend/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "12345",
          currentGPA: 3.2,
          completedCredits: 45,
        }),
      });
      const data = await response.json();

      expect(data.data.recommendations[0]).toHaveProperty("name");
    });

    it("should include course credits", async () => {
      const response = await app.request("/recommend/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "12345",
          currentGPA: 3.2,
          completedCredits: 45,
        }),
      });
      const data = await response.json();

      expect(data.data.recommendations[0]).toHaveProperty("credits");
      expect(typeof data.data.recommendations[0].credits).toBe("number");
    });

    it("should include recommendation reason", async () => {
      const response = await app.request("/recommend/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "12345",
          currentGPA: 3.2,
          completedCredits: 45,
        }),
      });
      const data = await response.json();

      expect(data.data.recommendations[0]).toHaveProperty("reason");
    });

    it("should require studentId", async () => {
      const response = await app.request("/recommend/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentGPA: 3.2,
          completedCredits: 45,
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
