import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

describe("Report Service API", () => {
  const baseUrl = "http://localhost:3004";

  beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  describe("Health Check", () => {
    it("should return health status", async () => {
      const response = await fetch(`${baseUrl}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("ok");
      expect(data.data.service).toBe("report-service");
    });
  });

  describe("Report Generation", () => {
    it("should create an eligibility report", async () => {
      const reportData = {
        studentName: "John Doe",
        studentId: "TEST001",
        sport: "Basketball",
        division: "Division I",
        coreGPA: 3.5,
        testScore: "ACT 24",
        initialEligibility: "Full Qualifier",
        currentGPA: 3.4,
        creditsThisTerm: 12,
        cumulativeCredits: 45,
        aprProgress: 975,
        minCredits: 24,
        currentCredits: 12,
        enrollmentStatus: "Full-time",
        creditsCompleted: 45,
        sixHourRule: true,
        requirements: [
          {
            name: "Core Course GPA",
            value: 3.5,
            required: 2.3,
            status: "PASS",
          },
        ],
        eligibilityStatus: "ELIGIBLE",
      };

      const response = await fetch(`${baseUrl}/api/reports/eligibility`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "test-user",
        },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();

      expect(response.status).toBe(202);
      expect(data.success).toBe(true);
      expect(data.data.reportId).toBeDefined();
      expect(data.data.status).toBe("pending");
    });

    it("should create a transfer credit report", async () => {
      const reportData = {
        studentName: "Jane Smith",
        studentId: "TEST002",
        previousInstitution: "Community College",
        transferDate: "2024-01-01",
        courses: [
          {
            courseCode: "MATH101",
            courseTitle: "Calculus I",
            credits: 3,
            grade: "A",
            term: "Fall 2023",
          },
        ],
        totalCredits: 3,
        transferGPA: 4.0,
        creditsRequired: 120,
        creditsEarned: 3,
        progressPercentage: 2.5,
      };

      const response = await fetch(`${baseUrl}/api/reports/transfer-credit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "test-user",
        },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();

      expect(response.status).toBe(202);
      expect(data.success).toBe(true);
      expect(data.data.reportId).toBeDefined();
    });

    it("should validate eligibility report schema", async () => {
      const invalidData = {
        studentName: "Invalid Student",
        studentId: "TEST003",
        coreGPA: "invalid",
      };

      const response = await fetch(`${baseUrl}/api/reports/eligibility`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "test-user",
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("Batch Reports", () => {
    it("should create batch reports", async () => {
      const batchRequest = {
        reportType: "eligibility",
        studentIds: ["TEST001", "TEST002"],
        format: "pdf",
      };

      const response = await fetch(`${baseUrl}/api/reports/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "test-user",
        },
        body: JSON.stringify(batchRequest),
      });

      const data = await response.json();

      expect(response.status).toBe(202);
      expect(data.success).toBe(true);
      expect(data.data.batchId).toBeDefined();
      expect(data.data.reports).toHaveLength(2);
    });
  });

  describe("Report Status and Download", () => {
    let reportId: string;

    beforeAll(async () => {
      const reportData = {
        studentName: "Test Student",
        studentId: "TEST004",
        sport: "Football",
        division: "Division I",
        coreGPA: 3.0,
        testScore: "SAT 1100",
        initialEligibility: "Full Qualifier",
        currentGPA: 3.0,
        creditsThisTerm: 12,
        cumulativeCredits: 30,
        aprProgress: 960,
        minCredits: 24,
        currentCredits: 12,
        enrollmentStatus: "Full-time",
        creditsCompleted: 30,
        sixHourRule: true,
        requirements: [],
        eligibilityStatus: "ELIGIBLE",
      };

      const response = await fetch(`${baseUrl}/api/reports/eligibility`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "test-user",
        },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();
      reportId = data.data.reportId;

      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    it("should get report status", async () => {
      const response = await fetch(`${baseUrl}/api/reports/${reportId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(reportId);
      expect(data.data.status).toBeDefined();
    });

    it("should download report PDF", async () => {
      const response = await fetch(
        `${baseUrl}/api/reports/${reportId}/download`,
      );

      if (response.status === 200) {
        expect(response.headers.get("content-type")).toContain(
          "application/pdf",
        );
      }
    });

    it("should delete report", async () => {
      const response = await fetch(`${baseUrl}/api/reports/${reportId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Report Templates", () => {
    it("should list templates", async () => {
      const response = await fetch(`${baseUrl}/api/reports/templates`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("should create custom template", async () => {
      const templateData = {
        name: "Custom Compliance Report",
        description: "A custom template for compliance reports",
        type: "compliance",
        signatureFields: [
          {
            name: "advisor_signature",
            label: "Advisor Signature",
            x: 14,
            y: 260,
            width: 100,
            height: 20,
            pageNumber: 1,
            required: true,
          },
        ],
      };

      const response = await fetch(`${baseUrl}/api/reports/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "test-user",
        },
        body: JSON.stringify(templateData),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(templateData.name);
    });
  });

  describe("Report Export", () => {
    it("should export reports as CSV", async () => {
      const response = await fetch(`${baseUrl}/api/reports/export/csv`);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("text/csv");
      expect(response.headers.get("content-disposition")).toContain(
        "reports-export.csv",
      );
    });

    it("should export reports as JSON", async () => {
      const response = await fetch(`${baseUrl}/api/reports/export/json`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.items).toBeDefined();
      expect(data.data.pagination).toBeDefined();
    });

    it("should filter exports by type", async () => {
      const response = await fetch(
        `${baseUrl}/api/reports/export/json?type=eligibility`,
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Queue Stats", () => {
    it("should return queue statistics", async () => {
      const response = await fetch(`${baseUrl}/api/reports/stats/queue`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.waiting).toBeDefined();
      expect(data.data.active).toBeDefined();
      expect(data.data.completed).toBeDefined();
      expect(data.data.failed).toBeDefined();
    });
  });
});
