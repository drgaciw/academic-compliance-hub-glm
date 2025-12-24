import { auditLogArchiveManager } from "../src/audit-log-archive";
import { AgentType } from "@prisma/client";
import { prisma } from "@aah/database";

describe("Archive Search Tests", () => {
  let testTransferEvaluationId: string;

  beforeAll(async () => {
    testTransferEvaluationId = `archive-search-test-${Date.now()}`;
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

  describe("Search in Archives", () => {
    test("should find archived logs by action", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "ARCHIVED_SEARCH_ACTION",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const results = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
        action: "ARCHIVED_SEARCH_ACTION",
      });

      expect(results.length).toBe(1);
      expect(results[0].action).toBe("ARCHIVED_SEARCH_ACTION");
    });

    test("should find archived logs by agent type", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.COMPLIANCE_AGENT,
          action: "COMPLIANCE_SEARCH",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const results = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
        agentType: AgentType.COMPLIANCE_AGENT,
      });

      expect(results.length).toBe(1);
      expect(results[0].agentType).toBe(AgentType.COMPLIANCE_AGENT);
    });

    test("should find archived logs by date range", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      const startDate = new Date(eightYearsAgo);
      startDate.setDate(startDate.getDate() - 1);

      const endDate = new Date(eightYearsAgo);
      endDate.setDate(endDate.getDate() + 1);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "DATE_RANGE_SEARCH",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const results = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
        startDate,
        endDate,
      });

      expect(results.length).toBe(1);
    });
  });

  describe("Multiple Archive Search", () => {
    test("should search across multiple archives", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "ARCHIVE_1_LOG",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "ARCHIVE_2_LOG",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const results = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(results.length).toBe(2);
      const actions = results.map((r) => r.action);
      expect(actions).toContain("ARCHIVE_1_LOG");
      expect(actions).toContain("ARCHIVE_2_LOG");
    });

    test("should filter results from multiple archives", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.createMany({
        data: [
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "FILTER_TEST_1",
            timestamp: eightYearsAgo,
          },
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.COMPLIANCE_AGENT,
            action: "FILTER_TEST_2",
            timestamp: eightYearsAgo,
          },
        ],
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const results = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
        agentType: AgentType.EVALUATION_AGENT,
      });

      expect(results.length).toBe(1);
      expect(results[0].agentType).toBe(AgentType.EVALUATION_AGENT);
    });
  });

  describe("Combined Filters", () => {
    test("should combine action and agent type filters", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.createMany({
        data: [
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "COMBINED_FILTER_TARGET",
            timestamp: eightYearsAgo,
          },
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.COMPLIANCE_AGENT,
            action: "COMBINED_FILTER_TARGET",
            timestamp: eightYearsAgo,
          },
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "COMBINED_FILTER_OTHER",
            timestamp: eightYearsAgo,
          },
        ],
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const results = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
        agentType: AgentType.EVALUATION_AGENT,
        action: "TARGET",
      });

      expect(results.length).toBe(1);
      expect(results[0].action).toBe("COMBINED_FILTER_TARGET");
      expect(results[0].agentType).toBe(AgentType.EVALUATION_AGENT);
    });

    test("should combine date range with other filters", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      const startDate = new Date(eightYearsAgo);
      startDate.setDate(startDate.getDate() - 5);

      await prisma.auditLog.createMany({
        data: [
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "DATE_COMBO_TARGET",
            timestamp: eightYearsAgo,
          },
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "DATE_COMBO_OTHER",
            timestamp: new Date(startDate.getTime() - 86400000 * 10),
          },
        ],
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const results = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
        startDate,
        action: "TARGET",
      });

      expect(results.length).toBe(1);
      expect(results[0].action).toBe("DATE_COMBO_TARGET");
    });

    test("should filter by multiple agent types", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.createMany({
        data: [
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: "MULTI_AGENT_FILTER",
            timestamp: eightYearsAgo,
          },
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.COMPLIANCE_AGENT,
            action: "MULTI_AGENT_FILTER",
            timestamp: eightYearsAgo,
          },
          {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.DOCUMENT_AGENT,
            action: "MULTI_AGENT_FILTER",
            timestamp: eightYearsAgo,
          },
        ],
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const results = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
        agentType: [AgentType.EVALUATION_AGENT, AgentType.COMPLIANCE_AGENT],
      });

      expect(results.length).toBe(2);
      const agentTypes = results.map((r) => r.agentType);
      expect(agentTypes).toContain(AgentType.EVALUATION_AGENT);
      expect(agentTypes).toContain(AgentType.COMPLIANCE_AGENT);
      expect(agentTypes).not.toContain(AgentType.DOCUMENT_AGENT);
    });
  });

  describe("Search Results Ordering", () => {
    test("should return search results in descending order", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      const dates = [
        new Date(eightYearsAgo.getTime() - 86400000 * 5),
        new Date(eightYearsAgo.getTime() - 86400000 * 3),
        new Date(eightYearsAgo.getTime() - 86400000 * 1),
        new Date(eightYearsAgo.getTime() - 86400000 * 4),
        new Date(eightYearsAgo.getTime() - 86400000 * 2),
      ];

      for (let i = 0; i < dates.length; i++) {
        await prisma.auditLog.create({
          data: {
            transferEvaluationId: testTransferEvaluationId,
            agentType: AgentType.EVALUATION_AGENT,
            action: `ORDERED_SEARCH_${i}`,
            timestamp: dates[i],
          },
        });
      }

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const results = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(results.length).toBe(5);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          results[i + 1].timestamp.getTime(),
        );
      }
    });
  });

  describe("Case Insensitive Search", () => {
    test("should perform case insensitive action search", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "CaseInsensitiveTest",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const lowercaseResults = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
        action: "caseinsensitivetest",
      });

      const uppercaseResults = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
        action: "CASEINSENSITIVETEST",
      });

      const mixedResults = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
        action: "CaseInsensitive",
      });

      expect(lowercaseResults.length).toBe(1);
      expect(uppercaseResults.length).toBe(1);
      expect(mixedResults.length).toBe(1);
    });
  });

  describe("Empty Search Results", () => {
    test("should return empty when no archives exist", async () => {
      const results = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
      });

      expect(results).toEqual([]);
    });

    test("should return empty for non-matching filters", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "EXISTING_LOG",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      const results = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
        action: "NON_EXISTENT_ACTION",
      });

      expect(results).toEqual([]);
    });
  });

  describe("Archived vs Active Data", () => {
    test("should search only in archives, not active logs", async () => {
      const eightYearsAgo = new Date();
      eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "ARCHIVED_LOG",
          timestamp: eightYearsAgo,
        },
      });

      await auditLogArchiveManager.archiveLogsOlderThan(7);

      await prisma.auditLog.create({
        data: {
          transferEvaluationId: testTransferEvaluationId,
          agentType: AgentType.EVALUATION_AGENT,
          action: "ARCHIVED_LOG",
          timestamp: new Date(),
        },
      });

      const archivedResults = await auditLogArchiveManager.searchArchives({
        transferEvaluationId: testTransferEvaluationId,
        action: "ARCHIVED_LOG",
      });

      const activeResults = await auditLogArchiveManager.getActiveLogs({
        transferEvaluationId: testTransferEvaluationId,
        action: "ARCHIVED_LOG",
      });

      expect(archivedResults.length).toBe(1);
      expect(activeResults.length).toBe(1);
    });
  });
});
