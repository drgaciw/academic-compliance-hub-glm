/**
 * API Tests for Course Mapping Service
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { build } from "hono";
import app from "../src/index";

describe("Course Mapping Service API", () => {
  let testServer: any;

  beforeEach(() => {
    testServer = build();
    testServer.route("/api", app);
  });

  afterEach(() => {
    if (testServer) {
      testServer = null;
    }
  });

  describe("Health Check", () => {
    it("should return health status", async () => {
      const res = await testServer.request("/health");
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.status).toBe("ok");
      expect(json.data.service).toBe("course-mapping");
    });
  });

  describe("POST /api/course-mappings", () => {
    it("should validate required fields", async () => {
      const res = await testServer.request("/api/course-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferEvaluationId: "test-id",
          sourceCourseCode: "CS101",
          sourceCourseTitle: "Intro to CS",
          sourceCredits: 3,
          sourceSubjectArea: "COMPUTER_SCIENCE",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("should require sourceInstitutionId", async () => {
      const res = await testServer.request("/api/course-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferEvaluationId: "test-id",
          sourceCourseCode: "CS101",
          sourceCourseTitle: "Intro to CS",
          sourceCredits: 3,
          sourceSubjectArea: "COMPUTER_SCIENCE",
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/course-mappings/:id", () => {
    it("should return 404 for non-existent mapping", async () => {
      const res = await testServer.request(
        "/api/course-mappings/non-existent-id",
      );
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/course-mappings/:id", () => {
    it("should return 404 for non-existent mapping", async () => {
      const res = await testServer.request(
        "/api/course-mappings/non-existent-id",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceCourseCode: "CS102" }),
        },
      );
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/course-mappings/:id", () => {
    it("should return 404 for non-existent mapping", async () => {
      const res = await testServer.request(
        "/api/course-mappings/non-existent-id",
        {
          method: "DELETE",
        },
      );
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/course-mappings/batch-import", () => {
    it("should validate mappings array", async () => {
      const res = await testServer.request(
        "/api/course-mappings/batch-import",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mappings: [
              {
                transferEvaluationId: "test-id",
                sourceInstitutionId: "inst-id",
                sourceCourseCode: "CS101",
                sourceCourseTitle: "Intro to CS",
                sourceCredits: 3,
                sourceSubjectArea: "COMPUTER_SCIENCE",
              },
            ],
          }),
        },
      );

      expect(res.status).toBe(201);
    });
  });

  describe("GET /api/course-mappings/search", () => {
    it("should search without filters", async () => {
      const res = await testServer.request("/api/course-mappings/search");
      expect(res.status).toBe(200);
    });

    it("should search with sourceCode filter", async () => {
      const res = await testServer.request(
        "/api/course-mappings/search?sourceCode=CS101",
      );
      expect(res.status).toBe(200);
    });

    it("should search with pagination", async () => {
      const res = await testServer.request(
        "/api/course-mappings/search?page=1&pageSize=10",
      );
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/course-mappings/similar/:text", () => {
    it("should require search text", async () => {
      const res = await testServer.request("/api/course-mappings/similar/");
      expect(res.status).toBe(404);
    });

    it("should return results for valid text", async () => {
      const res = await testServer.request(
        "/api/course-mappings/similar/Introduction to Computer Science",
      );
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/course-mappings/verify/:id", () => {
    it("should return 404 for non-existent mapping", async () => {
      const res = await testServer.request(
        "/api/course-mappings/verify/non-existent-id",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verificationStatus: "APPROVED",
          }),
        },
      );
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/course-mappings/institutions/:id", () => {
    it("should return 404 for non-existent institution", async () => {
      const res = await testServer.request(
        "/api/course-mappings/institutions/non-existent-id",
      );
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/course-mappings/approve-batch", () => {
    it("should validate mappingIds array", async () => {
      const res = await testServer.request(
        "/api/course-mappings/approve-batch",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mappingIds: [],
          }),
        },
      );

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/course-mappings/:id/confidence", () => {
    it("should return 404 for non-existent mapping", async () => {
      const res = await testServer.request(
        "/api/course-mappings/non-existent-id/confidence",
      );
      expect(res.status).toBe(404);
    });
  });
});
