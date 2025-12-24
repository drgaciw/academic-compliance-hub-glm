import { auditLogArchiveManager } from "../src/audit-log-archive";
import { AgentType } from "@prisma/client";
import { prisma } from "@aah/database";

describe("Active Logs Tests", () => {
  let testTransferEvaluationId: string;

  beforeAll(async () => {
    testTransferEvaluationId = `active-logs-test-${Date.now()}`;
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({
      where: { transferEvaluationId: testTransferEvaluationId },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.auditLog.deleteMany({
      where: { transferEvaluationId: testTransferEvaluationId },
    });
  });

  describe("Non-Archived Logs Accessibility", () => {
    test("should only return non-archived logs", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.createMany({
        data: [
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "OLD_LOG_1",
            timestamp: eightYearsAgo,
          },
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "OLD_LOG_2",
            timestamp: eightYearsAgo,
          },
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "RECENT_LOG",
            timestamp: new Date(),
          },
        ],
      });

      const logsBeforeArchive = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(logsBeforeArchive.length).toBe(3);

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const logsAfterArchive = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(logsAfterArchive.length).toBe(1);
      expect(logsAfterArchive[0].action).toBe("RECENT_LOG");
    });

    test("should include logs from exactly 7 years ago", async () => {
      const sevenYearsAgo = new Date();
      sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);
      sevenYearsAgo.setHours(0, 0, 0, 0);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "SEVEN_YEAR_BOUNDARY",
          timestamp: sevenYearsAgo,
        },
      });

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(logs.length).toBe(1);
    });

    test("should include logs from 7 years and 1 day ago", async () => {
      const sevenYearsOneDayAgo = new Date();
      sevenYearsOneDayAgo.setFullYear(sevenYearsOneDayAgo.getFullYear() - 7);
      sevenYearsOneDayAgo.setDate(sevenYearsOneDayAgo.getDate() - 1);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "SEVEN_YEARS_ONE_DAY",
          timestamp: sevenYearsOneDayAgo,
        },
      });

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(logs.length).toBe(1);
    });
  });

  describe("Query Filtering for Active Logs", () => {
    beforeEach(async () => {
      const dates = [
        { years: 0, action: "TODAY", agent: AgentType.EVALUATION_AGENT },
        { years: 1, action: "ONE_YEAR", agent: AgentType.COMPLIANCE_AGENT },
        { years: 2, action: "TWO_YEARS", agent: AgentType.DOCUMENT_AGENT },
        { years: 3, action: "THREE_YEARS", agent: AgentType.RULE_ENGINE },
        { years: 4, action: "FOUR_YEARS", agent: AgentType.NOTIFICATION_AGENT },
        { years: 5, action: "FIVE_YEARS", agent: AgentType.ADVISOR_AGENT },
        { years: 6, action: "SIX_YEARS", agent: AgentType.EVALUATION_AGENT },
        { years: 7, action: "SEVEN_YEARS", agent: AgentType.COMPLIANCE_AGENT },
      ];

      for (const { years, action, agent } of dates) {
        const date = new Date();
        date.setFullYear(date.getFullYear() - years);

        await prisma.auditLog.create({
          data: {
            transferEvaluationId: testTransferEvaluationId,
            agentType: agent,
            action,
            timestamp: date,
          },
        });
      }
    });

    test("should filter by agent type", async () => {
      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
        agentType: AgentType.EVALUATION_AGENT,
      });

      expect(logs.length).toBeGreaterThanOrEqual(2);
      logs.forEach((log) => {
        expect(log.agentType).toBe(AgentType.EVALUATION_AGENT);
      });
    });

    test("should filter by action pattern", async () => {
      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
        action: "YEAR",
      });

      expect(logs.length).toBeGreaterThan(0);
      logs.forEach((log) => {
        expect(log.action.toLowerCase()).toContain("year");
      });
    });

    test("should filter by date range", async () => {
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 3);

      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() - 1);

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
        startDate,
        endDate,
      });

      expect(logs.length).toBeGreaterThanOrEqual(1);
      logs.forEach((log) => {
        expect(log.timestamp.getTime()).toBeGreaterThanOrEqual(
          startDate.getTime(),
        );
        expect(log.timestamp.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    test("should combine multiple filters", async () => {
      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
        agentType: [AgentType.EVALUATION_AGENT, AgentType.COMPLIANCE_AGENT],
        action: "YEAR",
      });

      expect(logs.length).toBeGreaterThan(0);
      logs.forEach((log) => {
        expect([
          AgentType.EVALUATION_AGENT,
          AgentType.COMPLIANCE_AGENT,
        ]).toContain(log.agentType);
        expect(log.action.toLowerCase()).toContain("year");
      });
    });
  });

  describe("Archived Logs Exclusion", () => {
    test("should not return logs older than 7 years after archival", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "SHOULD_BE_ARCHIVED",
          timestamp: eightYearsAgo,
        },
      });

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "SHOULD_REMAIN",
          timestamp: new Date(),
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const allLogs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(allLogs.length).toBe(1);
      expect(allLogs[0].action).toBe("SHOULD_REMAIN");
    });

    test("should not return archived logs in query results", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "ARCHIVED_EVALUATION",
          timestamp: eightYearsAgo,
        },
      });

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "ACTIVE_EVALUATION",
          timestamp: new Date(),
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const evaluationLogs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
        agentType: AgentType.EVALUATION_AGENT,
      });

      expect(evaluationLogs.length).toBe(1);
      expect(evaluationLogs[0].action).toBe("ACTIVE_EVALUATION");
    });

    test("should handle multiple archival operations", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "BATCH_1",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "BATCH_2",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "RECENT",
          timestamp: new Date(),
        },
      });

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe("RECENT");
    });
  });

  describe("Active Logs Ordering", () => {
    test("should return logs in descending order by timestamp", async () => {
      const dates = [
        new Date(Date.now() - 86400000 * 3),
        new Date(Date.now() - 86400000 * 1),
        new Date(Date.now() - 86400000 * 2),
        new Date(),
      ];

      for (let i = 0; i < dates.length; i++) {
        await prisma.auditLog.create({
          data: {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: `ORDERED_LOG_${i}`,
            timestamp: dates[i],
          },
        });
      }

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(logs.length).toBe(4);
      for (let i = 0; i < logs.length - 1; i++) {
        expect(logs[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          logs[i + 1].timestamp.getTime(),
        );
      }
    });

    test("should maintain order with mixed agent types", async () => {
      const now = new Date();

      for (let i = 0; i < 5; i++) {
        const timestamp = new Date(now.getTime() - i * 86400000);
        const agentTypes = Object.values(AgentType);

        await prisma.auditLog.create({
          data: {
            transferEvaluationId: testTransferEvaluationId,
            agentType: agentTypes[i % agentTypes.length],
            action: `MIXED_ORDER_${i}`,
            timestamp,
          },
        });
      }

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      for (let i = 0; i < logs.length - 1; i++) {
        expect(logs[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          logs[i + 1].timestamp.getTime(),
        );
      }
    });
  });

  describe("Empty Results Handling", () => {
    test("should return empty array when no logs exist", async () => {
      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(logs).toEqual([]);
    });

    test("should return empty array for non-matching filters", async () => {
      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "TEST_ACTION",
          timestamp: new Date(),
        },
      });

      const logs = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
        action: "NON_EXISTENT_ACTION",
      });

      expect(logs).toEqual([]);
    });
  });
});
