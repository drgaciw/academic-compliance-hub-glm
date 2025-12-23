import { auditLogger, AuditLogEntry } from "../src/audit-logger";
import { AgentType, Prisma } from "@prisma/client";
import { prisma } from "@aah/database";

interface AuditInputData {
  userId: string;
  dataType: string;
  studentId: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
}

describe("AuditLogger", () => {
  let testTransferEvaluationId: string;
  let testUserId: string;
  let testStudentId: string;

  beforeAll(async () => {
    testTransferEvaluationId = "test-eval-001";
    testUserId = "user-001";
    testStudentId = "student-001";
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("logAction", () => {
    test("should create an audit log entry", async () => {
      const entry: AuditLogEntry = {
        transferEvaluationId: testTransferEvaluationId,
        agentType: AgentType.EVALUATION_AGENT,
        action: "TEST_ACTION",
        inputData: { test: "data" },
        outputData: { result: "success" },
        duration: 100,
      };

      const auditLog = await auditLogger.logAction(entry);

      expect(auditLog).toBeDefined();
      expect(auditLog.id).toBeDefined();
      expect(auditLog.transferEvaluationId).toBe(testTransferEvaluationId);
      expect(auditLog.agentType).toBe(AgentType.EVALUATION_AGENT);
      expect(auditLog.action).toBe("TEST_ACTION");
      expect(auditLog.duration).toBe(100);
    });

    test("should auto-generate timestamp", async () => {
      const entry: AuditLogEntry = {
        transferEvaluationId: testTransferEvaluationId,
        agentType: AgentType.COMPLIANCE_AGENT,
        action: "AUTO_TIMESTAMP",
      };

      const auditLog = await auditLogger.logAction(entry);

      expect(auditLog.timestamp).toBeDefined();
      expect(auditLog.timestamp).toBeInstanceOf(Date);
    });

    test("should store error messages", async () => {
      const entry: AuditLogEntry = {
        transferEvaluationId: testTransferEvaluationId,
        agentType: AgentType.DOCUMENT_AGENT,
        action: "ERROR_ACTION",
        inputData: { input: "test" },
        errorMessage: "Test error message",
      };

      const auditLog = await auditLogger.logAction(entry);

      expect(auditLog.errorMessage).toBe("Test error message");
    });
  });

  describe("logWithLatency", () => {
    test("should measure and log operation duration", async () => {
      const mockFn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          inputData: { input: "test" },
          outputData: { result: "success" },
        };
      };

      const { result, auditLog } = await auditLogger.logWithLatency(
        testTransferEvaluationId,
        AgentType.EVALUATION_AGENT,
        "LATENCY_TEST",
        mockFn,
      );

      expect(result).toEqual({ result: "success" });
      expect(auditLog.duration).toBeDefined();
      expect(auditLog.duration).toBeGreaterThanOrEqual(10);
      expect(auditLog.inputData).toEqual({ input: "test" });
    });

    test("should log errors with error message", async () => {
      const mockFn = async () => {
        throw new Error("Test error");
      };

      await expect(
        auditLogger.logWithLatency(
          testTransferEvaluationId,
          AgentType.COMPLIANCE_AGENT,
          "ERROR_TEST",
          mockFn,
        ),
      ).rejects.toThrow("Test error");
    });
  });

  describe("queryLogs", () => {
    test("should query logs by transfer evaluation ID", async () => {
      const logs = await auditLogger.getLogsByEvaluationId(
        testTransferEvaluationId,
      );

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
      logs.forEach((log) => {
        expect(log.transferEvaluationId).toBe(testTransferEvaluationId);
      });
    });

    test("should query logs by agent type", async () => {
      const logs = await auditLogger.getLogsByAgentType(
        AgentType.EVALUATION_AGENT,
      );

      expect(Array.isArray(logs)).toBe(true);
      logs.forEach((log) => {
        expect(log.agentType).toBe(AgentType.EVALUATION_AGENT);
      });
    });

    test("should query logs by date range", async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);

      const logs = await auditLogger.getLogsByDateRange(startDate, endDate);

      expect(Array.isArray(logs)).toBe(true);
      logs.forEach((log) => {
        expect(log.timestamp.getTime()).toBeGreaterThanOrEqual(
          startDate.getTime(),
        );
        expect(log.timestamp.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    test("should query logs with action filter", async () => {
      const logs = await auditLogger.queryLogs({
        action: "TEST_ACTION",
      });

      expect(Array.isArray(logs)).toBe(true);
      logs.forEach((log) => {
        expect(log.action.toLowerCase()).toContain("test_action");
      });
    });
  });

  describe("getLogSummary", () => {
    test("should return log summary with statistics", async () => {
      const summary = await auditLogger.getLogSummary();

      expect(summary).toBeDefined();
      expect(typeof summary.totalLogs).toBe("number");
      expect(typeof summary.averageDuration).toBe("number");
      expect(typeof summary.errorCount).toBe("number");
      expect(typeof summary.successCount).toBe("number");
      expect(summary.logsByAgentType).toBeDefined();
      expect(summary.logsByAction).toBeDefined();
    });

    test("should calculate correct statistics", async () => {
      await auditLogger.logAction({
        transferEvaluationId: testTransferEvaluationId,
        agentType: AgentType.EVALUATION_AGENT,
        action: "SUMMARY_TEST_1",
        duration: 100,
      });

      await auditLogger.logAction({
        transferEvaluationId: testTransferEvaluationId,
        agentType: AgentType.EVALUATION_AGENT,
        action: "SUMMARY_TEST_2",
        duration: 200,
      });

      await auditLogger.logAction({
        transferEvaluationId: testTransferEvaluationId,
        agentType: AgentType.COMPLIANCE_AGENT,
        action: "SUMMARY_TEST_3",
        errorMessage: "Test error",
        duration: 50,
      });

      const summary = await auditLogger.getLogSummary({
        transferEvaluationId: testTransferEvaluationId,
        action: "SUMMARY_TEST",
      });

      expect(summary.totalLogs).toBeGreaterThanOrEqual(3);
      expect(summary.errorCount).toBeGreaterThanOrEqual(1);
      expect(summary.successCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe("logEligibilityEvaluation", () => {
    test("should log eligibility evaluation", async () => {
      const inputData = {
        studentId: testStudentId,
        credits: 24,
        gpa: 3.5,
      };

      const outputData = {
        eligible: true,
        reason: "All requirements met",
      };

      const auditLog = await auditLogger.logEligibilityEvaluation(
        testTransferEvaluationId,
        inputData,
        outputData,
        150,
      );

      expect(auditLog.agentType).toBe(AgentType.EVALUATION_AGENT);
      expect(auditLog.action).toBe("ELIGIBILITY_EVALUATION");
      expect(auditLog.inputData).toEqual(inputData);
      expect(auditLog.outputData).toEqual(outputData);
      expect(auditLog.duration).toBe(150);
    });
  });

  describe("logComplianceCheck", () => {
    test("should log compliance check", async () => {
      const inputData = { ruleId: "14.3.1.2" };
      const outputData = { compliant: true };

      const auditLog = await auditLogger.logComplianceCheck(
        testTransferEvaluationId,
        inputData,
        outputData,
        75,
      );

      expect(auditLog.agentType).toBe(AgentType.COMPLIANCE_AGENT);
      expect(auditLog.action).toBe("COMPLIANCE_CHECK");
    });
  });

  describe("logDocumentProcessing", () => {
    test("should log document processing", async () => {
      const inputData = {
        documentId: "doc-001",
        documentType: "transcript",
      };
      const outputData = {
        extracted: true,
        courseCount: 15,
      };

      const auditLog = await auditLogger.logDocumentProcessing(
        testTransferEvaluationId,
        inputData,
        outputData,
        500,
      );

      expect(auditLog.agentType).toBe(AgentType.DOCUMENT_AGENT);
      expect(auditLog.action).toBe("DOCUMENT_PROCESSING");
    });
  });

  describe("logRuleApplication", () => {
    test("should log rule application", async () => {
      const inputData = { ruleId: "14.3.1.2", courseId: "MATH-101" };
      const outputData = { applies: true, mapping: "MATH-101" };

      const auditLog = await auditLogger.logRuleApplication(
        testTransferEvaluationId,
        inputData,
        outputData,
        25,
      );

      expect(auditLog.agentType).toBe(AgentType.RULE_ENGINE);
      expect(auditLog.action).toBe("RULE_APPLICATION");
    });
  });

  describe("logReportGeneration", () => {
    test("should log report generation", async () => {
      const inputData = { reportType: "eligibility", studentId: testStudentId };
      const outputData = { filePath: "/reports/report-001.pdf" };

      const auditLog = await auditLogger.logReportGeneration(
        testTransferEvaluationId,
        "eligibility",
        inputData,
        outputData,
        1000,
      );

      expect(auditLog.agentType).toBe(AgentType.COMPLIANCE_AGENT);
      expect(auditLog.action).toBe("REPORT_GENERATION:eligibility");
    });
  });

  describe("logComplianceOverride", () => {
    test("should log compliance override", async () => {
      const inputData = {
        originalStatus: "INELIGIBLE",
        overrideReason: "Waiver granted",
        officerId: testUserId,
      };
      const outputData = { newStatus: "ELIGIBLE" };

      const auditLog = await auditLogger.logComplianceOverride(
        testTransferEvaluationId,
        inputData,
        outputData,
        50,
      );

      expect(auditLog.agentType).toBe(AgentType.COMPLIANCE_AGENT);
      expect(auditLog.action).toBe("COMPLIANCE_OVERRIDE");
    });
  });

  describe("FERPA Compliance Logging", () => {
    test("should log student data access", async () => {
      const auditLog = await auditLogger.logStudentDataAccess(
        testUserId,
        testStudentId,
        "TRANSCRIPT",
        "Academic advising session",
        "192.168.1.1",
        "Mozilla/5.0",
      );

      expect(auditLog.agentType).toBe(AgentType.ADVISOR_AGENT);
      expect(auditLog.action).toBe("USER_ACTION:VIEW");
      expect(auditLog.inputData).toMatchObject({
        userId: testUserId,
        dataType: "TRANSCRIPT",
        studentId: testStudentId,
      });
    });

    test("should log student data export", async () => {
      const auditLog = await auditLogger.logStudentDataExport(
        testUserId,
        testStudentId,
        "EVALUATION",
        "Official record request",
        "192.168.1.1",
      );

      expect(auditLog.action).toBe("USER_ACTION:EXPORT");
      expect(auditLog.inputData).not.toBeNull();
      const inputData = auditLog.inputData as unknown as AuditInputData;
      expect(inputData.dataType).toBe("EVALUATION");
    });

    test("should log student data modification", async () => {
      const auditLog = await auditLogger.logStudentDataModification(
        testUserId,
        testStudentId,
        "COURSE_MAPPING",
        "Correcting course equivalency",
      );

      expect(auditLog.action).toBe("USER_ACTION:MODIFY");
      expect(auditLog.inputData).not.toBeNull();
      const inputData = auditLog.inputData as unknown as AuditInputData;
      expect(inputData.dataType).toBe("COURSE_MAPPING");
    });
  });

  describe("Log Management", () => {
    test("should export logs to JSON", async () => {
      const json = await auditLogger.exportLogsToJSON(testTransferEvaluationId);

      expect(typeof json).toBe("string");
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);

      if (parsed.length > 0) {
        expect(parsed[0]).toHaveProperty("id");
        expect(parsed[0]).toHaveProperty("action");
        expect(parsed[0]).toHaveProperty("timestamp");
      }
    });

    test("should verify log integrity", async () => {
      const isIntact = await auditLogger.verifyLogIntegrity(
        testTransferEvaluationId,
      );

      expect(typeof isIntact).toBe("boolean");
    });
  });

  describe("Retention Policy", () => {
    test("should support 7-year retention deletion", async () => {
      const deletedCount = await auditLogger.deleteOldLogs(7);

      expect(typeof deletedCount).toBe("number");
      expect(deletedCount).toBeGreaterThanOrEqual(0);
    });
  });
});
