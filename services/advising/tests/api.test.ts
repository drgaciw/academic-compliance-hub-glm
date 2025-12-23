import { describe, it, expect } from "@jest/globals";
import app from "../src/index";

describe("Advising Service API Tests", () => {
  describe("H2-002-012: Health Check", () => {
    it("should return 200 status", async () => {
      const response = await app.request("/health");
      expect(response.status).toBe(200);
    });

    it("should return service information", async () => {
      const response = await app.request("/health");
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.status).toBe("ok");
      expect(data.data.service).toBe("advising");
    });
  });

  describe("H2-002-013: Get Academic Plan", () => {
    it("should return academic plan for student", async () => {
      const response = await app.request("/students/12345/academic-plan");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.studentId).toBe("12345");
    });

    it("should include current GPA", async () => {
      const response = await app.request("/students/12345/academic-plan");
      const data = await response.json();

      expect(data.data.currentGPA).toBeDefined();
      expect(typeof data.data.currentGPA).toBe("number");
    });

    it("should include completed credits", async () => {
      const response = await app.request("/students/12345/academic-plan");
      const data = await response.json();

      expect(data.data.completedCredits).toBeDefined();
      expect(typeof data.data.completedCredits).toBe("number");
    });

    it("should include target credits", async () => {
      const response = await app.request("/students/12345/academic-plan");
      const data = await response.json();

      expect(data.data.targetCredits).toBeDefined();
      expect(typeof data.data.targetCredits).toBe("number");
    });

    it("should include progress percentage", async () => {
      const response = await app.request("/students/12345/academic-plan");
      const data = await response.json();

      expect(data.data.progress).toBeDefined();
      expect(typeof data.data.progress).toBe("number");
    });

    it("should handle invalid student ID", async () => {
      const response = await app.request("/students/invalid/academic-plan");
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("H2-002-014: Get Course Recommendations", () => {
    it("should return recommendations for student", async () => {
      const response = await app.request("/students/12345/recommendations");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.studentId).toBe("12345");
    });

    it("should return array of recommendations", async () => {
      const response = await app.request("/students/12345/recommendations");
      const data = await response.json();

      expect(data.data.recommendations).toBeInstanceOf(Array);
      expect(data.data.recommendations.length).toBeGreaterThan(0);
    });

    it("should include course code", async () => {
      const response = await app.request("/students/12345/recommendations");
      const data = await response.json();

      expect(data.data.recommendations[0]).toHaveProperty("code");
    });

    it("should include course name", async () => {
      const response = await app.request("/students/12345/recommendations");
      const data = await response.json();

      expect(data.data.recommendations[0]).toHaveProperty("name");
    });

    it("should include course credits", async () => {
      const response = await app.request("/students/12345/recommendations");
      const data = await response.json();

      expect(data.data.recommendations[0]).toHaveProperty("credits");
      expect(typeof data.data.recommendations[0].credits).toBe("number");
    });
  });

  describe("H2-002-015: Create Academic Plan", () => {
    it("should create academic plan", async () => {
      const response = await app.request("/students/12345/academic-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: [
            { code: "MATH-101", credits: 3 },
            { code: "ENG-101", credits: 3 },
          ],
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.studentId).toBe("12345");
    });

    it("should validate courses array", async () => {
      const response = await app.request("/students/12345/academic-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: [],
        }),
      });
      expect(response.status).toBe(201);
    });

    it("should validate course code", async () => {
      const response = await app.request("/students/12345/academic-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: [{ credits: 3 }],
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should validate course credits", async () => {
      const response = await app.request("/students/12345/academic-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: [{ code: "MATH-101" }],
        }),
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should handle multiple courses", async () => {
      const response = await app.request("/students/12345/academic-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: [
            { code: "MATH-101", credits: 3 },
            { code: "ENG-101", credits: 3 },
            { code: "SCI-101", credits: 4 },
          ],
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.courses.length).toBe(3);
    });
  });
});
